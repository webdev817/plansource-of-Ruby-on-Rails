$(document).ready(function(){
  // Components
  var $body = $(document.body);
  var $troubleshootWidget = $("#troubleshoot-widget");
  var $troubleshootFormOverlay = $("#troubleshoot-form-overlay");
  var $filesTable = $("#troubleshoot-files-table");

  // Inputs
  var $problemInput = $("#troubleshoot-form-problem");
  var $formError = $("#troubleshoot-form-error");
  var $uploadError = $("#troubleshoot-upload-error");

  // Buttons
  var $closeButton = $("#troubleshoot-form-close");
  var $submitButton = $("#troubleshoot-form-submit");
  var $cancelButton = $("#troubleshoot-form-cancel");

  $troubleshootWidget.click(function () {
    $body.css('overflow', 'hidden');
    $troubleshootFormOverlay.css('display', 'block');
  });

  var closeModal = function () {
    $body.css('overflow', 'visible');
    $troubleshootFormOverlay.css('display', 'none');

    // Remove file uploads
    $("#troubleshoot-uploaded-files .file-preview").remove();
    // Clear problem textarea
    $problemInput.val("");
    // Reset submit button
    $submitButton.prop('disabled', false);
    $submitButton.text("Submit");
  };

  $cancelButton.click(function () { closeModal(); });
  $closeButton.click(function () { closeModal(); });

  $submitButton.click(function () {
    if ($submitButton.prop('disabled')) return;

    var url = location.href;
    var userAgent = navigator.userAgent;
    var message = $problemInput.val();
    var attachments = [];

    if (!message.length) {
      return $formError.text("Please describe your problem.");
    }

    $("#troubleshoot-uploaded-files .file-preview").each(function (i, el) {
      attachments.push($(el).data("id"));
    });

    // Disable submit button and change text
    $submitButton.prop('disabled', true);
    $submitButton.text("Submitting...");

    $.ajax({
      url: '/api/troubleshoot',
      type: 'POST',
      data : {
        message: message,
        attachment_ids: attachments,
        user_agent: userAgent,
        url: url,
      },
    }).then(function(data, t, xhr){
      if (!$.isEmptyObject(data)) {
        closeModal();
      } else {
        $formError.text("There was a problem when submitting your issue. Please try again later.");
      }
    })
  });

  Dropzone.options.troubleshootFilesDnd = {
    paramName: "files",
    maxFilesize: 40,
    uploadMultiple: true,
    createImageThumbnails: false,
    // Hide the previews.  We'll make our own.
    previewTemplate: '<div style="display:none"></div>',
    dictDefaultMessage: 'Drop files here or click to upload.',
  };

  PlanSource.troubleshootDropzone = new Dropzone("div#troubleshoot-files-dnd", {
    url: "/api/troubleshoot/upload_attachments"
  });

  $filesTable.delegate(".remove", "click", function (e) {
    $(e.target.parentNode.parentNode.parentNode).remove();
    var $remainingUploads = $filesTable.find(".file-preview");

    // If no files remaining, reset modal for uploads
    if (!$remainingUploads.length) {
      // Clear errors when everything is reset
      $uploadError.text("");
    }
  });

  PlanSource.troubleshootDropzone.on("sending", function (file, responseData) {
    var $dropzone = $("#troubleshoot-files-dnd");

    $submitButton.show();
    $submitButton.prop("disabled", true);
    $submitButton.text("Uploading...");
    $filesTable.show();
  });

  PlanSource.troubleshootDropzone.on("complete", function (file) {
    if (!file.accepted) {
      $uploadError.text("There was an error with some files. They won't be uploaded.");
      return;
    }

    $submitButton.prop("disabled", false);
    $submitButton.text("Submit");
  });

  // On success for a file, add element to list with ID and date from server response
  // On submit photos, grab all info from HTML data attrs then upload to server.
  PlanSource.troubleshootDropzone.on("success", function (file, responseData) {
    var returnFiles = responseData.files;

    // Success is called for every file so might as well double check the
    // filename was returned before adding element to DOM.
    for (var i = 0; i < returnFiles.length; i++) {
      var returnFile = returnFiles[i];

      if (returnFile.original_filename !== file.name) continue;

      $("#troubleshoot-uploaded-files").append([
        '<tr class="file-preview" data-id="' + returnFile.id + '">',
          '<td>',
            returnFile.original_filename,
          '</td>',
          '<td>',
            '<span class="pull-right">',
              '<a class="remove">Remove</a>',
            '</span>',
          '</td>',
        '</tr>',
      ].join(""));
    }
  });
});
