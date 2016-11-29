jQuery(document).ready(function() {

	var meta_image_frame;
        // Runs when the image button is clicked.
        jQuery('#shift8_portfolio_image_button').click(function(e){

                // Prevents the default action from occuring.
                e.preventDefault();

                // If the frame already exists, re-open it.
                if ( meta_image_frame ) {
                        meta_image_frame.open();
                        return;
                }

                // Sets up the media library frame
                meta_image_frame = wp.media.frames.meta_image_frame = wp.media({
                        title: shift8_portfolio_image.title,
                        button: { text:  shift8_portfolio_image.button },
                        library: { type: 'image' },
                });

                // Runs when an image is selected.
console.log('hi');
                meta_image_frame.on('select', function(){

                        // Grabs the attachment selection and creates a JSON representation of the model.
                        var media_attachment = meta_image_frame.state().get('selection').first().toJSON();

                        // Sends the attachment URL to our custom image input field.
			console.log('media url : ' + JSON.stringify(media_attachment.url));
                        jQuery('#shift8_portfolio_image').val(media_attachment.url);
                });

                // Opens the media library frame.
                meta_image_frame.open();
        });

        var meta_gallery_frame;
        // Runs when the image button is clicked.
        jQuery('#shift8_portfolio_gallery_button').click(function(e){

                // Prevents the default action from occuring.
                e.preventDefault();

                // If the frame already exists, re-open it.
                if ( meta_gallery_frame ) {
                        meta_gallery_frame.open();
                        return;
                }

                // Sets up the media library frame
                meta_gallery_frame = wp.media.frames.meta_gallery_frame = wp.media({
                        title: shift8_portfolio_gallery.title,
                        button: { text:  shift8_portfolio_gallery.button },
                        library: { type: 'image' },
			multiple: true
                });

		// Create Featured Gallery state. This is essentially the Gallery state, but selection behavior is altered.
		meta_gallery_frame.states.add([
			new wp.media.controller.Library({
				id:         'shift8-portfolio-gallery',
				title:      'Select Images for Gallery',
				priority:   20,
				toolbar:    'main-gallery',
				filterable: 'uploaded',
				library:    wp.media.query( meta_gallery_frame.options.library ),
				multiple:   meta_gallery_frame.options.multiple ? 'reset' : false,
				editable:   true,
				allowLocalEdits: true,
				displaySettings: true,
				displayUserSettings: true
			}),
		]);

		meta_gallery_frame.on('open', function() {
			var selection = meta_gallery_frame.state().get('selection');
			var library = meta_gallery_frame.state('gallery-edit').get('library');
			var ids = jQuery('#fg_perm_metadata').val();
			if (ids) {
				idsArray = ids.split(',');
				idsArray.forEach(function(id) {
					attachment = wp.media.attachment(id);
					attachment.fetch();
					selection.add( attachment ? [ attachment ] : [] );
				});
				meta_gallery_frame.setState('gallery-edit');
				idsArray.forEach(function(id) {
					attachment = wp.media.attachment(id);
					attachment.fetch();
					library.add( attachment ? [ attachment ] : [] );
				});
			}
		});

		meta_gallery_frame.on('ready', function() {
			jQuery( '.media-modal' ).addClass( 'no-sidebar' );
			//fixBackButton();
		});
		 
		// When an image is selected, run a callback.
		meta_gallery_frame.on('update', function() {
			var imageIDArray = [];
			var imageHTML = '';
			var metadataString = '';
			images = meta_gallery_frame.state().get('library');
			images.each(function(attachment) {
				imageIDArray.push(attachment.attributes.id);
				imageHTML += '<li>'+button+'<img id="'+attachment.attributes.id+'" src="'+attachment.attributes.url+'"></li>';
			});
			metadataString = imageIDArray.join(",");
			console.log('Meta data string : ' + JSON.stringify(metadataString));
			console.log('image html ' + imageHTML);
			if (metadataString) {
				jQuery("#fg_perm_metadata").val(metadataString);
				jQuery("#shift8_portfolio_gallery").html(imageHTML);
				//jQuery('#fg_select').text('Edit Selection');
				//jQuery('#fg_removeall').addClass('visible');
				setTimeout(function(){
					ajaxUpdateTempMetaData();
				},0);
			}
		});
		 
		// Finally, open the modal
		meta_gallery_frame.open();
		
        });

	function ajaxUpdateTempMetaData() {

		jQuery.ajax({
			type : "post",
			dataType : "json",
			url : myAjax.ajaxurl,
			data : {
				action: "fg_update_temp", 
				fg_post_id: jQuery("#fg_perm_metadata").data("post_id"), 
				fg_temp_noncedata: jQuery("#fg_temp_noncedata").val(), 
				fg_temp_metadata: jQuery("#fg_perm_metadata").val()
			},
			success: function(response) {
				if (response == "error") {
					alert("There was an issue with updating the live preview. Make sure that you click Save to ensure your changes aren't lost.");
				}
			}
		});

	}

});
