/*
** NOTE: This file is generated by Gulp and should not be edited directly!
** Any changes made directly to this file will be overwritten next time its asset group is processed by Gulp.
*/

/*
 * jQuery Iframe Transport Plugin
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* global define, require, window, document */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS:
        factory(require('jquery'));
    } else {
        // Browser globals:
        factory(window.jQuery);
    }
}(function ($) {
    'use strict';

    // Helper variable to create unique names for the transport iframes:
    var counter = 0;

    // The iframe transport accepts four additional options:
    // options.fileInput: a jQuery collection of file input fields
    // options.paramName: the parameter name for the file form data,
    //  overrides the name property of the file input field(s),
    //  can be a string or an array of strings.
    // options.formData: an array of objects with name and value properties,
    //  equivalent to the return data of .serializeArray(), e.g.:
    //  [{name: 'a', value: 1}, {name: 'b', value: 2}]
    // options.initialIframeSrc: the URL of the initial iframe src,
    //  by default set to "javascript:false;"
    $.ajaxTransport('iframe', function (options) {
        if (options.async) {
            // javascript:false as initial iframe src
            // prevents warning popups on HTTPS in IE6:
            /*jshint scripturl: true */
            var initialIframeSrc = options.initialIframeSrc || 'javascript:false;',
            /*jshint scripturl: false */
                form,
                iframe,
                addParamChar;
            return {
                send: function (_, completeCallback) {
                    form = $('<form style="display:none;"></form>');
                    form.attr('accept-charset', options.formAcceptCharset);
                    addParamChar = /\?/.test(options.url) ? '&' : '?';
                    // XDomainRequest only supports GET and POST:
                    if (options.type === 'DELETE') {
                        options.url = options.url + addParamChar + '_method=DELETE';
                        options.type = 'POST';
                    } else if (options.type === 'PUT') {
                        options.url = options.url + addParamChar + '_method=PUT';
                        options.type = 'POST';
                    } else if (options.type === 'PATCH') {
                        options.url = options.url + addParamChar + '_method=PATCH';
                        options.type = 'POST';
                    }
                    // IE versions below IE8 cannot set the name property of
                    // elements that have already been added to the DOM,
                    // so we set the name along with the iframe HTML markup:
                    counter += 1;
                    iframe = $(
                        '<iframe src="' + initialIframeSrc +
                            '" name="iframe-transport-' + counter + '"></iframe>'
                    ).bind('load', function () {
                        var fileInputClones,
                            paramNames = $.isArray(options.paramName) ?
                                    options.paramName : [options.paramName];
                        iframe
                            .unbind('load')
                            .bind('load', function () {
                                var response;
                                // Wrap in a try/catch block to catch exceptions thrown
                                // when trying to access cross-domain iframe contents:
                                try {
                                    response = iframe.contents();
                                    // Google Chrome and Firefox do not throw an
                                    // exception when calling iframe.contents() on
                                    // cross-domain requests, so we unify the response:
                                    if (!response.length || !response[0].firstChild) {
                                        throw new Error();
                                    }
                                } catch (e) {
                                    response = undefined;
                                }
                                // The complete callback returns the
                                // iframe content document as response object:
                                completeCallback(
                                    200,
                                    'success',
                                    {'iframe': response}
                                );
                                // Fix for IE endless progress bar activity bug
                                // (happens on form submits to iframe targets):
                                $('<iframe src="' + initialIframeSrc + '"></iframe>')
                                    .appendTo(form);
                                window.setTimeout(function () {
                                    // Removing the form in a setTimeout call
                                    // allows Chrome's developer tools to display
                                    // the response result
                                    form.remove();
                                }, 0);
                            });
                        form
                            .prop('target', iframe.prop('name'))
                            .prop('action', options.url)
                            .prop('method', options.type);
                        if (options.formData) {
                            $.each(options.formData, function (index, field) {
                                $('<input type="hidden"/>')
                                    .prop('name', field.name)
                                    .val(field.value)
                                    .appendTo(form);
                            });
                        }
                        if (options.fileInput && options.fileInput.length &&
                                options.type === 'POST') {
                            fileInputClones = options.fileInput.clone();
                            // Insert a clone for each file input field:
                            options.fileInput.after(function (index) {
                                return fileInputClones[index];
                            });
                            if (options.paramName) {
                                options.fileInput.each(function (index) {
                                    $(this).prop(
                                        'name',
                                        paramNames[index] || options.paramName
                                    );
                                });
                            }
                            // Appending the file input fields to the hidden form
                            // removes them from their original location:
                            form
                                .append(options.fileInput)
                                .prop('enctype', 'multipart/form-data')
                                // enctype must be set as encoding for IE:
                                .prop('encoding', 'multipart/form-data');
                            // Remove the HTML5 form attribute from the input(s):
                            options.fileInput.removeAttr('form');
                        }
                        form.submit();
                        // Insert the file input fields at their original location
                        // by replacing the clones with the originals:
                        if (fileInputClones && fileInputClones.length) {
                            options.fileInput.each(function (index, input) {
                                var clone = $(fileInputClones[index]);
                                // Restore the original name and form properties:
                                $(input)
                                    .prop('name', clone.prop('name'))
                                    .attr('form', clone.attr('form'));
                                clone.replaceWith(input);
                            });
                        }
                    });
                    form.append(iframe).appendTo(document.body);
                },
                abort: function () {
                    if (iframe) {
                        // javascript:false as iframe src aborts the request
                        // and prevents warning popups on HTTPS in IE6.
                        // concat is used to avoid the "Script URL" JSLint error:
                        iframe
                            .unbind('load')
                            .prop('src', initialIframeSrc);
                    }
                    if (form) {
                        form.remove();
                    }
                }
            };
        }
    });

    // The iframe transport returns the iframe content document as response.
    // The following adds converters from iframe to text, json, html, xml
    // and script.
    // Please note that the Content-Type for JSON responses has to be text/plain
    // or text/html, if the browser doesn't include application/json in the
    // Accept header, else IE will show a download dialog.
    // The Content-Type for XML responses on the other hand has to be always
    // application/xml or text/xml, so IE properly parses the XML response.
    // See also
    // https://github.com/blueimp/jQuery-File-Upload/wiki/Setup#content-type-negotiation
    $.ajaxSetup({
        converters: {
            'iframe text': function (iframe) {
                return iframe && $(iframe[0].body).text();
            },
            'iframe json': function (iframe) {
                return iframe && $.parseJSON($(iframe[0].body).text());
            },
            'iframe html': function (iframe) {
                return iframe && $(iframe[0].body).html();
            },
            'iframe xml': function (iframe) {
                var xmlDoc = iframe && iframe[0];
                return xmlDoc && $.isXMLDoc(xmlDoc) ? xmlDoc :
                        $.parseXML((xmlDoc.XMLDocument && xmlDoc.XMLDocument.xml) ||
                            $(xmlDoc.body).html());
            },
            'iframe script': function (iframe) {
                return iframe && $.globalEval($(iframe[0].body).text());
            }
        }
    });

}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpxdWVyeS5pZnJhbWUtdHJhbnNwb3J0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxBQUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoianF1ZXJ5LmlmcmFtZS10cmFuc3BvcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogalF1ZXJ5IElmcmFtZSBUcmFuc3BvcnQgUGx1Z2luXG4gKiBodHRwczovL2dpdGh1Yi5jb20vYmx1ZWltcC9qUXVlcnktRmlsZS1VcGxvYWRcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMSwgU2ViYXN0aWFuIFRzY2hhblxuICogaHR0cHM6Ly9ibHVlaW1wLm5ldFxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cblxuLyogZ2xvYmFsIGRlZmluZSwgcmVxdWlyZSwgd2luZG93LCBkb2N1bWVudCAqL1xuXG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAvLyBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgQU1EIG1vZHVsZTpcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5J10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIC8vIE5vZGUvQ29tbW9uSlM6XG4gICAgICAgIGZhY3RvcnkocmVxdWlyZSgnanF1ZXJ5JykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEJyb3dzZXIgZ2xvYmFsczpcbiAgICAgICAgZmFjdG9yeSh3aW5kb3cualF1ZXJ5KTtcbiAgICB9XG59KGZ1bmN0aW9uICgkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gSGVscGVyIHZhcmlhYmxlIHRvIGNyZWF0ZSB1bmlxdWUgbmFtZXMgZm9yIHRoZSB0cmFuc3BvcnQgaWZyYW1lczpcbiAgICB2YXIgY291bnRlciA9IDA7XG5cbiAgICAvLyBUaGUgaWZyYW1lIHRyYW5zcG9ydCBhY2NlcHRzIGZvdXIgYWRkaXRpb25hbCBvcHRpb25zOlxuICAgIC8vIG9wdGlvbnMuZmlsZUlucHV0OiBhIGpRdWVyeSBjb2xsZWN0aW9uIG9mIGZpbGUgaW5wdXQgZmllbGRzXG4gICAgLy8gb3B0aW9ucy5wYXJhbU5hbWU6IHRoZSBwYXJhbWV0ZXIgbmFtZSBmb3IgdGhlIGZpbGUgZm9ybSBkYXRhLFxuICAgIC8vICBvdmVycmlkZXMgdGhlIG5hbWUgcHJvcGVydHkgb2YgdGhlIGZpbGUgaW5wdXQgZmllbGQocyksXG4gICAgLy8gIGNhbiBiZSBhIHN0cmluZyBvciBhbiBhcnJheSBvZiBzdHJpbmdzLlxuICAgIC8vIG9wdGlvbnMuZm9ybURhdGE6IGFuIGFycmF5IG9mIG9iamVjdHMgd2l0aCBuYW1lIGFuZCB2YWx1ZSBwcm9wZXJ0aWVzLFxuICAgIC8vICBlcXVpdmFsZW50IHRvIHRoZSByZXR1cm4gZGF0YSBvZiAuc2VyaWFsaXplQXJyYXkoKSwgZS5nLjpcbiAgICAvLyAgW3tuYW1lOiAnYScsIHZhbHVlOiAxfSwge25hbWU6ICdiJywgdmFsdWU6IDJ9XVxuICAgIC8vIG9wdGlvbnMuaW5pdGlhbElmcmFtZVNyYzogdGhlIFVSTCBvZiB0aGUgaW5pdGlhbCBpZnJhbWUgc3JjLFxuICAgIC8vICBieSBkZWZhdWx0IHNldCB0byBcImphdmFzY3JpcHQ6ZmFsc2U7XCJcbiAgICAkLmFqYXhUcmFuc3BvcnQoJ2lmcmFtZScsIGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmFzeW5jKSB7XG4gICAgICAgICAgICAvLyBqYXZhc2NyaXB0OmZhbHNlIGFzIGluaXRpYWwgaWZyYW1lIHNyY1xuICAgICAgICAgICAgLy8gcHJldmVudHMgd2FybmluZyBwb3B1cHMgb24gSFRUUFMgaW4gSUU2OlxuICAgICAgICAgICAgLypqc2hpbnQgc2NyaXB0dXJsOiB0cnVlICovXG4gICAgICAgICAgICB2YXIgaW5pdGlhbElmcmFtZVNyYyA9IG9wdGlvbnMuaW5pdGlhbElmcmFtZVNyYyB8fCAnamF2YXNjcmlwdDpmYWxzZTsnLFxuICAgICAgICAgICAgLypqc2hpbnQgc2NyaXB0dXJsOiBmYWxzZSAqL1xuICAgICAgICAgICAgICAgIGZvcm0sXG4gICAgICAgICAgICAgICAgaWZyYW1lLFxuICAgICAgICAgICAgICAgIGFkZFBhcmFtQ2hhcjtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc2VuZDogZnVuY3Rpb24gKF8sIGNvbXBsZXRlQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybSA9ICQoJzxmb3JtIHN0eWxlPVwiZGlzcGxheTpub25lO1wiPjwvZm9ybT4nKTtcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5hdHRyKCdhY2NlcHQtY2hhcnNldCcsIG9wdGlvbnMuZm9ybUFjY2VwdENoYXJzZXQpO1xuICAgICAgICAgICAgICAgICAgICBhZGRQYXJhbUNoYXIgPSAvXFw/Ly50ZXN0KG9wdGlvbnMudXJsKSA/ICcmJyA6ICc/JztcbiAgICAgICAgICAgICAgICAgICAgLy8gWERvbWFpblJlcXVlc3Qgb25seSBzdXBwb3J0cyBHRVQgYW5kIFBPU1Q6XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnR5cGUgPT09ICdERUxFVEUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnVybCA9IG9wdGlvbnMudXJsICsgYWRkUGFyYW1DaGFyICsgJ19tZXRob2Q9REVMRVRFJztcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudHlwZSA9ICdQT1NUJztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnR5cGUgPT09ICdQVVQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnVybCA9IG9wdGlvbnMudXJsICsgYWRkUGFyYW1DaGFyICsgJ19tZXRob2Q9UFVUJztcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudHlwZSA9ICdQT1NUJztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnR5cGUgPT09ICdQQVRDSCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudXJsID0gb3B0aW9ucy51cmwgKyBhZGRQYXJhbUNoYXIgKyAnX21ldGhvZD1QQVRDSCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnR5cGUgPSAnUE9TVCc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gSUUgdmVyc2lvbnMgYmVsb3cgSUU4IGNhbm5vdCBzZXQgdGhlIG5hbWUgcHJvcGVydHkgb2ZcbiAgICAgICAgICAgICAgICAgICAgLy8gZWxlbWVudHMgdGhhdCBoYXZlIGFscmVhZHkgYmVlbiBhZGRlZCB0byB0aGUgRE9NLFxuICAgICAgICAgICAgICAgICAgICAvLyBzbyB3ZSBzZXQgdGhlIG5hbWUgYWxvbmcgd2l0aCB0aGUgaWZyYW1lIEhUTUwgbWFya3VwOlxuICAgICAgICAgICAgICAgICAgICBjb3VudGVyICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGlmcmFtZSA9ICQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnPGlmcmFtZSBzcmM9XCInICsgaW5pdGlhbElmcmFtZVNyYyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1wiIG5hbWU9XCJpZnJhbWUtdHJhbnNwb3J0LScgKyBjb3VudGVyICsgJ1wiPjwvaWZyYW1lPidcbiAgICAgICAgICAgICAgICAgICAgKS5iaW5kKCdsb2FkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZpbGVJbnB1dENsb25lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbU5hbWVzID0gJC5pc0FycmF5KG9wdGlvbnMucGFyYW1OYW1lKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnBhcmFtTmFtZSA6IFtvcHRpb25zLnBhcmFtTmFtZV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZnJhbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudW5iaW5kKCdsb2FkJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYmluZCgnbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXcmFwIGluIGEgdHJ5L2NhdGNoIGJsb2NrIHRvIGNhdGNoIGV4Y2VwdGlvbnMgdGhyb3duXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdoZW4gdHJ5aW5nIHRvIGFjY2VzcyBjcm9zcy1kb21haW4gaWZyYW1lIGNvbnRlbnRzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBpZnJhbWUuY29udGVudHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdvb2dsZSBDaHJvbWUgYW5kIEZpcmVmb3ggZG8gbm90IHRocm93IGFuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBleGNlcHRpb24gd2hlbiBjYWxsaW5nIGlmcmFtZS5jb250ZW50cygpIG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjcm9zcy1kb21haW4gcmVxdWVzdHMsIHNvIHdlIHVuaWZ5IHRoZSByZXNwb25zZTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2UubGVuZ3RoIHx8ICFyZXNwb25zZVswXS5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBjb21wbGV0ZSBjYWxsYmFjayByZXR1cm5zIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZnJhbWUgY29udGVudCBkb2N1bWVudCBhcyByZXNwb25zZSBvYmplY3Q6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlQ2FsbGJhY2soXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAyMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7J2lmcmFtZSc6IHJlc3BvbnNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGaXggZm9yIElFIGVuZGxlc3MgcHJvZ3Jlc3MgYmFyIGFjdGl2aXR5IGJ1Z1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAoaGFwcGVucyBvbiBmb3JtIHN1Ym1pdHMgdG8gaWZyYW1lIHRhcmdldHMpOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCc8aWZyYW1lIHNyYz1cIicgKyBpbml0aWFsSWZyYW1lU3JjICsgJ1wiPjwvaWZyYW1lPicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kVG8oZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlbW92aW5nIHRoZSBmb3JtIGluIGEgc2V0VGltZW91dCBjYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhbGxvd3MgQ2hyb21lJ3MgZGV2ZWxvcGVyIHRvb2xzIHRvIGRpc3BsYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSByZXNwb25zZSByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm0ucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wcm9wKCd0YXJnZXQnLCBpZnJhbWUucHJvcCgnbmFtZScpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wcm9wKCdhY3Rpb24nLCBvcHRpb25zLnVybClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucHJvcCgnbWV0aG9kJywgb3B0aW9ucy50eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmZvcm1EYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJC5lYWNoKG9wdGlvbnMuZm9ybURhdGEsIGZ1bmN0aW9uIChpbmRleCwgZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIi8+JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wcm9wKCduYW1lJywgZmllbGQubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC52YWwoZmllbGQudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kVG8oZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5maWxlSW5wdXQgJiYgb3B0aW9ucy5maWxlSW5wdXQubGVuZ3RoICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudHlwZSA9PT0gJ1BPU1QnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZUlucHV0Q2xvbmVzID0gb3B0aW9ucy5maWxlSW5wdXQuY2xvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJbnNlcnQgYSBjbG9uZSBmb3IgZWFjaCBmaWxlIGlucHV0IGZpZWxkOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuZmlsZUlucHV0LmFmdGVyKGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmlsZUlucHV0Q2xvbmVzW2luZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5wYXJhbU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5maWxlSW5wdXQuZWFjaChmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucHJvcChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbmFtZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1OYW1lc1tpbmRleF0gfHwgb3B0aW9ucy5wYXJhbU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBcHBlbmRpbmcgdGhlIGZpbGUgaW5wdXQgZmllbGRzIHRvIHRoZSBoaWRkZW4gZm9ybVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZXMgdGhlbSBmcm9tIHRoZWlyIG9yaWdpbmFsIGxvY2F0aW9uOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChvcHRpb25zLmZpbGVJbnB1dClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnByb3AoJ2VuY3R5cGUnLCAnbXVsdGlwYXJ0L2Zvcm0tZGF0YScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVuY3R5cGUgbXVzdCBiZSBzZXQgYXMgZW5jb2RpbmcgZm9yIElFOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucHJvcCgnZW5jb2RpbmcnLCAnbXVsdGlwYXJ0L2Zvcm0tZGF0YScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB0aGUgSFRNTDUgZm9ybSBhdHRyaWJ1dGUgZnJvbSB0aGUgaW5wdXQocyk6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5maWxlSW5wdXQucmVtb3ZlQXR0cignZm9ybScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybS5zdWJtaXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEluc2VydCB0aGUgZmlsZSBpbnB1dCBmaWVsZHMgYXQgdGhlaXIgb3JpZ2luYWwgbG9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJ5IHJlcGxhY2luZyB0aGUgY2xvbmVzIHdpdGggdGhlIG9yaWdpbmFsczpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlSW5wdXRDbG9uZXMgJiYgZmlsZUlucHV0Q2xvbmVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuZmlsZUlucHV0LmVhY2goZnVuY3Rpb24gKGluZGV4LCBpbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2xvbmUgPSAkKGZpbGVJbnB1dENsb25lc1tpbmRleF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSZXN0b3JlIHRoZSBvcmlnaW5hbCBuYW1lIGFuZCBmb3JtIHByb3BlcnRpZXM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoaW5wdXQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucHJvcCgnbmFtZScsIGNsb25lLnByb3AoJ25hbWUnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdmb3JtJywgY2xvbmUuYXR0cignZm9ybScpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvbmUucmVwbGFjZVdpdGgoaW5wdXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5hcHBlbmQoaWZyYW1lKS5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGFib3J0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpZnJhbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGphdmFzY3JpcHQ6ZmFsc2UgYXMgaWZyYW1lIHNyYyBhYm9ydHMgdGhlIHJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFuZCBwcmV2ZW50cyB3YXJuaW5nIHBvcHVwcyBvbiBIVFRQUyBpbiBJRTYuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25jYXQgaXMgdXNlZCB0byBhdm9pZCB0aGUgXCJTY3JpcHQgVVJMXCIgSlNMaW50IGVycm9yOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWZyYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnVuYmluZCgnbG9hZCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnByb3AoJ3NyYycsIGluaXRpYWxJZnJhbWVTcmMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChmb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gVGhlIGlmcmFtZSB0cmFuc3BvcnQgcmV0dXJucyB0aGUgaWZyYW1lIGNvbnRlbnQgZG9jdW1lbnQgYXMgcmVzcG9uc2UuXG4gICAgLy8gVGhlIGZvbGxvd2luZyBhZGRzIGNvbnZlcnRlcnMgZnJvbSBpZnJhbWUgdG8gdGV4dCwganNvbiwgaHRtbCwgeG1sXG4gICAgLy8gYW5kIHNjcmlwdC5cbiAgICAvLyBQbGVhc2Ugbm90ZSB0aGF0IHRoZSBDb250ZW50LVR5cGUgZm9yIEpTT04gcmVzcG9uc2VzIGhhcyB0byBiZSB0ZXh0L3BsYWluXG4gICAgLy8gb3IgdGV4dC9odG1sLCBpZiB0aGUgYnJvd3NlciBkb2Vzbid0IGluY2x1ZGUgYXBwbGljYXRpb24vanNvbiBpbiB0aGVcbiAgICAvLyBBY2NlcHQgaGVhZGVyLCBlbHNlIElFIHdpbGwgc2hvdyBhIGRvd25sb2FkIGRpYWxvZy5cbiAgICAvLyBUaGUgQ29udGVudC1UeXBlIGZvciBYTUwgcmVzcG9uc2VzIG9uIHRoZSBvdGhlciBoYW5kIGhhcyB0byBiZSBhbHdheXNcbiAgICAvLyBhcHBsaWNhdGlvbi94bWwgb3IgdGV4dC94bWwsIHNvIElFIHByb3Blcmx5IHBhcnNlcyB0aGUgWE1MIHJlc3BvbnNlLlxuICAgIC8vIFNlZSBhbHNvXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2JsdWVpbXAvalF1ZXJ5LUZpbGUtVXBsb2FkL3dpa2kvU2V0dXAjY29udGVudC10eXBlLW5lZ290aWF0aW9uXG4gICAgJC5hamF4U2V0dXAoe1xuICAgICAgICBjb252ZXJ0ZXJzOiB7XG4gICAgICAgICAgICAnaWZyYW1lIHRleHQnOiBmdW5jdGlvbiAoaWZyYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmcmFtZSAmJiAkKGlmcmFtZVswXS5ib2R5KS50ZXh0KCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2lmcmFtZSBqc29uJzogZnVuY3Rpb24gKGlmcmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpZnJhbWUgJiYgJC5wYXJzZUpTT04oJChpZnJhbWVbMF0uYm9keSkudGV4dCgpKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnaWZyYW1lIGh0bWwnOiBmdW5jdGlvbiAoaWZyYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmcmFtZSAmJiAkKGlmcmFtZVswXS5ib2R5KS5odG1sKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2lmcmFtZSB4bWwnOiBmdW5jdGlvbiAoaWZyYW1lKSB7XG4gICAgICAgICAgICAgICAgdmFyIHhtbERvYyA9IGlmcmFtZSAmJiBpZnJhbWVbMF07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHhtbERvYyAmJiAkLmlzWE1MRG9jKHhtbERvYykgPyB4bWxEb2MgOlxuICAgICAgICAgICAgICAgICAgICAgICAgJC5wYXJzZVhNTCgoeG1sRG9jLlhNTERvY3VtZW50ICYmIHhtbERvYy5YTUxEb2N1bWVudC54bWwpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh4bWxEb2MuYm9keSkuaHRtbCgpKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnaWZyYW1lIHNjcmlwdCc6IGZ1bmN0aW9uIChpZnJhbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaWZyYW1lICYmICQuZ2xvYmFsRXZhbCgkKGlmcmFtZVswXS5ib2R5KS50ZXh0KCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==