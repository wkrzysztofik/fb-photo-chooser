/**
* Plugin PhotoChooser
*
* 
*
* Copyright (C) 2012  Starfield Studio (www.starfieldstudio.pl)
*
*
* @package     PhotoChooser
* @author      Starfield Studio
* @copyright   2012 Starfield Studio
* @link        http://www.starfieldstudio.pl
* @version     1.0 
*/

(function($) {
    $.fn.photoChooser = function(options) {
		
		var settings = $.extend( {
		  scope	:	'user_photos',
		  select	:	'albums',
		  afterChoice	:	null,
		  beforeShowPopup	:	null,
		  afterClosePopup	:	null,
		  lang	: {
			'header' : 'Facebook Photo Chooser',
			'close' : 'Close x',
			'legend'	:	'Choose photo from yours Facebook album.',
			'back_to_albums'	:	'&laquo back to albums',
			'ok'	: 'Ok',
			'cancel'	:	'Cancel'
		  }
		}, options);
         
        
        $(this).click(function() {
			
			methods._createHtml();
			
			if(settings.beforeShowPopup != null) {
				eval(settings.beforeShowPopup + '()');
			} else {
				methods._beforeShowPopup();
			}			
			
			methods.initPopup();
            
            return false;
        })
		
		$('#photoChooser .btn_cancel, #photoChooser .close').live('click', function() {
			
			methods.hidePopup();
			
			$('.btn_back_to_albums').hide();
			
			if(settings.afterClosePopup != null) {
				eval(settings.afterClosePopup + '()');
			} else {
				methods._afterClosePopup();
			}	
            
            return false;
        })
        
		
		$('.fb-album').live('click', function() {
		
			var album_id = $(this).attr('rel');
			
			methods.getPhotos(album_id);
			
			$('.btn_back_to_albums').fadeIn();
		
			return false;
		});
        
		
		$('.fb-photo').live('click', function() {
		
			$('.fb-photo').removeClass('active');
			$(this).addClass('active');
			
			$('#photoChooser .btn_submit').attr('rel', $(this).attr('rel'));
			
			$('#photoChooser .btn_submit').removeClass('disabled');
		
			return false;
		});
        
		
		$('.btn_back_to_albums').live('click', function() {
			
			methods.getAlbums();
			
			$(this).fadeOut();
			
			$('#photoChooser .btn_submit').addClass('disabled');
		
			return false;
		});
        
		
		$('#photoChooser .btn_submit').live('click', function() {
		
			var photoPath = $(this).attr('rel');
			
			if(!$(this).hasClass('disabled')) {
				//alert(photoPath);
				if(settings.afterChoice != null) {
					eval(settings.afterChoice + '(photoPath)');
				} else {
					methods._afterChoice(photoPath);
				}
			}
		
			methods.hidePopup();
		
			return false;
		});
        
		
		$('#photoChooser .wrapper').live('click', function() {
		
			$('.fb-photo').removeClass('active');
			$('#photoChooser .btn_submit').addClass('disabled');
		
			return false;
		});
        
        //metody publiczne
        var methods = {
			initPopup: function() {
				methods._facebookConnect();
				
				$('#photoChooser').fadeIn();
			},
			hidePopup: function() {
				$('#photoChooser').fadeOut();
			},
        	/*
        	 * Load users albums
        	 */
            getAlbums: function() {
            
				$('#photoChooser .wrapper ul').text('');
				
				FB.api('/me/albums',  function(resp) {
					
					for (var i=0, l=resp.data.length; i<l; i++){
					
						var html = 	'<li id="album_' + resp.data[i].id + '"  class="fb-album" rel="' + resp.data[i].id + '"><div class="cover"><img src="" alt="" /></div>' + resp.data[i].name + '</li>';
						$('#photoChooser .wrapper ul').append(html);
						
						methods.loadAlbumCover(resp.data[i].id);
					}

				});
            },
            /*
             * Load album cover by albud_id
             */
            loadAlbumCover: function(album_id) {
				FB.api('/' + album_id + '/picture?type=thumbnail',  function(cover) {
					$('#album_' + album_id + ' img').attr('src', cover.data.url).fadeIn();
				});
					
            },
            /*
             * Load all photos from choosen album (album_id)
             */
            getPhotos: function(album_id) {
				$('#photoChooser .wrapper ul').text('');
				
				FB.api('/' + album_id + '/photos',  function(photos) {
					for (var i=0, l=photos.data.length; i<l; i++){
						
						var html = 	'<li id="photo_' + photos.data[i].id + '"  class="fb-photo" rel="' + photos.data[i].images[1].source + '"><div class="cover"><img src="' + photos.data[i].images[6].source + '" alt="" /></div></li>';
						$('#photoChooser .wrapper ul').append(html);
						$('#photo_' + photos.data[i].id  + ' img').fadeIn();
					}
				});
            },
            /*
             * Get list of all photos from Facebook account
             */
			getAllPhotos: function()  {
				FB.api('/me/albums',  function(resp) {
					
					for (var i=0, l=resp.data.length; i<l; i++){
						methods.getPhotos(resp.data[i].id);
					}

				});
			},
            /*
             * Connect with Facebook
             */
            _facebookConnect: function() {

				FB.getLoginStatus(function(response) {
					if(response.status == 'connected') {
						if(settings.select == 'albums') {
							methods.getAlbums();
						} else {
							methods.getAllPhotos();
						}
					} else {
						FB.login(function(response) {
							if (response.authResponse) {
								if(settings.select == 'albums') {
									methods.getAlbums();
								} else {
									methods.getAllPhotos();
								}
							}
						}, {scope: settings.scope, display: 'dialog' });
					}
				});
            },
			/*
			 * Create and inject into <body> html of photo chooser popup
			 */
			_createHtml: function() {
				var html = '<div id="photoChooser">';
					html += '<div class="header">' + settings.lang['header'] + '<a href="" class="close">' + settings.lang['close'] + '</a></div>';
					html += '<div class="content">';
					html += '<div class="legend">' + settings.lang['legend'] + '</div><div class="wrapper"><ul></ul></div>';
					html += '<div class="footer"><a href="" class="btn_back_to_albums"><span>' + settings.lang['back_to_albums'] + '</span></a>';
					html += '<a href="" class="btn_cancel"><span>' + settings.lang['cancel'] + '</span></a><a href="" class="btn_submit disabled" rel="">';
					html += '<span>' + settings.lang['ok'] + '</span></a></div>';
					html += '</div></div>';
					
					$('body').append(html);
			},
			_beforeShowPopup: function() {
				// execute before show photo chooser popup
			},
			_afterChoice: function(photoPath) {
				alert(photoPath);
			},
			_afterClosePopup: function() {
				// execute after cancel or close popup
			}
        };
         
		 
        return this.each(function() {

        }); 
    }
})(jQuery); 