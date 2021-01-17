---
---
$(function () {

  function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

  function generateUniqueFileName(name, file) {
    const ext = file.name.split('.').pop();
    const fileName = `${name}-${makeid(5)}.${ext}`;
    return encodeURI(fileName);
  }

  async function readAsDataURLAsync(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.toString());
      reader.onerror = () => reject();
      reader.readAsDataURL(file);
    });
  }

  function initValidation() {
    $("#contactForm").off("submit");
    $("#contactForm input,#contactForm textarea, #contactForm select").jqBootstrapValidation("destroy");
    $("#contactForm input,#contactForm textarea, #contactForm select").jqBootstrapValidation({
      preventSubmit: true,
      submitError: function ($form, event, errors) {
        // additional error messages or events
      },
      submitSuccess: async function ($form, event) {
        event.preventDefault(); // prevent default submit behaviour

        $this = $("#sendMessageButton");
        $this.prop("disabled", true); // Disable submit button until AJAX call is complete to prevent duplicate messages
        $this.empty();
        $this.append(`<i class="fa fa-spinner fa-spin"></i> Submitting...`);

        const details = [];

        // get values from FORM
        const phone = $("input#phone").val();
        const address = $("textarea#address").val();
        const numMembers = Number($("select#memberCount").val());

        for (let i = 0; i < numMembers; ++i) {
          const name = $(`input#name-${i}`).val();
          const age = $(`input#age-${i}`).val();
          const gender = $(`select#gender-${i}`).val();
          const photoIdType = $(`select#photoIdType-${i}`).val();
          const photoIdFile = $(`input#photoId-${i}`)[0].files[0];
          const photoIdFileName = generateUniqueFileName(name, photoIdFile);
          const photoId = await readAsDataURLAsync(photoIdFile);

          details.push({
            name,
            age,
            gender,
            phone,
            address,
            photoIdType,
            photoId,
            photoIdFileName
          });
        }

        $.ajax({
          url: "{{ site.rsvp_form_action_url }}",
          type: "POST",
          data: JSON.stringify(details),
          cache: false,

          success: function () {
            // Success message
            $('#success').html("<div class='alert alert-success'>");
            $('#success > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
              .append("</button>");
            $('#success > .alert-success')
              .append(`<strong>Thank you for submitting details. We look forward to hosting you at the wedding.</strong>`);
            $('#success > .alert-success')
              .append('</div>');
            //clear all fields
            $('#contactForm').trigger("reset");
          },

          error: function () {
            // Fail message
            $('#success').html("<div class='alert alert-danger'>");
            $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
              .append("</button>");
            $('#success > .alert-danger').append($("<strong>").text("Sorry, it seems that there is some problem with submitting your details right now. Please try again later!"));
            $('#success > .alert-danger').append('</div>');
            //clear all fields
            $('#contactForm').trigger("reset");
          },

          complete: function () {
            setTimeout(function () {
              $this.empty();
              $this.append("Submit details");
              $this.prop("disabled", false); // Re-enable submit button when AJAX call is complete
            }, 1000);
          }
        });
      },
      filter: function () {
        return $(this).is(":visible");
      },
    });
  };

  $("#memberCount").on("change", function () {
    const count = Number($(this).find(":selected").val());
    $("#rsvp-form-elements-container").empty();

    while ($("#rsvp-form-elements-container").children().length < count) {
      const index = $("#rsvp-form-elements-container").children().length;

      const memberDetailsElement = `
      <div class="row">
        <div class="col-md-12">
          <h6 class="text-muted">Member ${index + 1}</h3>
        </div>
        <div class="col-md-6">
          <div class="form-group">
            <input name="name-${index}" class="form-control" id="name-${index}" type="name" placeholder="Name*" required="required" data-validation-required-message="Please enter your name.">
            <p class="help-block text-danger"></p>
          </div>
        </div>
        <div class="col-md-2">
          <div class="form-group">
            <input name="age-${index}" class="form-control" id="age-${index}" type="number" placeholder="Age*" required="required" data-validation-required-message="Please enter your age.">
            <p class="help-block text-danger"></p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="form-group">
            <select name="gender-${index}" class="form-control" id="gender-${index}" placeholder="Gender" required="required" data-validation-required-message="Please select your gender.">
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <p class="help-block text-danger"></p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group">
            <select name="photoIdType-${index}" class="form-control" id="photoIdType-${index}" placeholder="Photo ID type" required="required" data-validation-required-message="Please select photo ID type.">
              <option value="">Photo ID</option>
              <option value="passport">Passport</option>
              <option value="driving license">Driving license</option>
              <option value="pan card">PAN card</option>
              <option value="aadhar card">Adhar card</option>
              <option value="other">Other</option>
            </select>
            <p class="help-block text-danger"></p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group">
            <input name="photoId-${index}" class="form-control file-selector" id="photoId-${index}" type="file" placeholder="Photo ID" required="required" data-validation-required-message="Please provide your photo ID.">
            <p class="help-block text-danger"></p>
          </div>
        </div>
      </div>`;

      $("#rsvp-form-elements-container").append(memberDetailsElement);
    }

    initValidation();
  });

  initValidation();

  $("a[data-toggle=\"tab\"]").click(function (e) {
    e.preventDefault();
    $(this).tab("show");
  });
});

/*When clicking on Full hide fail/success boxes */
$('#name').focus(function () {
  $('#success').html('');
});
