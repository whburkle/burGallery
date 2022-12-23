/** @class Gallery 
--------------------------------- 

	* @classdesc
	* Photo gallery featuring image and thumbnail dynamic builds, default or custom markup, pagination, slideshow, auto-play/pause, slide speed, keyboard functionality, multiple ways to close gallery, thumbnails, inline or modal box, and much more!

	* @summary 
	* Use one of the included html markups as is, or create your own custom html and/or templates.
	* Multiple pre-made css scripts included. Or use custom css however and wherever ya want, external and inline.
	* 
	* Keyboard functionality with arrows left (previous), right (next), enter/return (next), escape (close), and spacebar (play/pause).
	* Mobile/touch support with swipe capabilities for gallery image navigation.
	* Appearance mode to switch between dark/light mode
	* Image Captions show or hide. Can use html tags such as links, img, and iframes, just include in markup via jSon file.
	* Supports any image size, each can be displayed at their respective maximum dimensions via css markup. Reference full screen and full window toggle options if needed/wanted.
	* Populate Gallery from external source, such as the json file used in this example.
	* Create new gallery instances just by calling 'new Gallery', for example: const portfolio = new Gallery("portfolio", "js/portfolio_database_min.json", portfolio_options);
	* Each new Gallery instance can have as many albums as you like, and...
	* Call (create) as many new Gallery instances as you like.
	* 
	* Slideshow funtionality with play/pause, slideshow speed, auto-display with optional auto-play, loop, appearance mode, full window, full screen, download image.
	* 
	* Not all html markup is required: Don't want captions and/or the counter? For example. Just omit that part from your html markup and everything else will still function fine with no errors.
	* The only required html tags are for the following containers: ".gallery" (replace ".gallery" with the name of your gallery, for example ".portfolio"), ".images" and ".grid".
	* Then you must pass a name (gallery name, for example "portfolio"), relative url to your gallery content/images. Add any optional "portfolio_options" if you'd like to customize, such as slideshow speed, loop, or templates, etc. 
	* Any time this documentation references "containers"...those are in the page html markup typically using div, p, or span tags with the corresponding class name, such as ".caption" or ".close".

	* @options:
	* Gallery name (for example: portfolio)
	* Relative url to external json database file (for example: js/portfolio_database_min.json)
	* Auto-play slideshow on page load (true/false) (To be used with auto-display)
	* Auto-display slideshow on page load (true/false)
	* Slideshow speed (milliseconds)
	* Slideshow loop (true/false)
	* Templates for custom images, thumbnails, and album menu markup
	* Callback function to custom_event() if a custom event/action is dependent on/waiting until after the gallery has loaded

	* @readonly
	* @todo:
	* Check if total_images should be simplified, it doesn't have to be re-calculated each time it is requested
	* Allow custom album title template (ref: "this.containers.title.innerHTML" for js and ".portfolio .title" for css)
	* Accessibility
	* Make sure numbers are numbers and strings are strings
	* Cleans user custom templates before use 
	* Custom "Counter" text, including play and pause
	* Improve/simplify (and secure?) template markup
	* Run-time error message improvements
	* Debugging and testing and debu...ugh
	* 
	* 
	* 
	* 
	* @notes:
	* 
	* 
	* this.component_name.forEach((obj) => { // element, index, array
		* if (obj === "first_btn" || 
			* obj === "last_btn" || 
			* obj === "next_btn" || 
			* obj === "previous_btn" ||
			* obj === "scroll") {

			* if (this.containers.gallery.querySelector(`.${ obj }`)) {
				* obj = this.containers.gallery.querySelector(`.${ obj }`);
					* obj.style.opacity = '30%';
				* obj.style.pointerEvents = 'none';
				* obj.style.cursor = 'default';
			* }
		* }
	* });
	* 
	* 
	*
	*/



class Gallery {

	/* Declare/Initialize variables, objects, arrays and their values for reference later
		// Most are dynamically given a value at some point in the class, which is why they are initially undefined
	--------------------------------- */
	constructor(name, dbase_file_relative_url, options) {

		// General gallery info
		this.info = {
			name: name, // Name of gallery (for example: portfolio) 
			directory: dbase_file_relative_url // Relative url to database (jSon) file
		};



		// All the possible html tags (via css classes) used as containers for gallery components
		this.containers = {
			gallery: undefined, // document.querySelector(`.${ this.info.name }`) // Primary "div" containing the entire gallery

			images: undefined, // document.querySelector(`.${ this.info.name }`).querySelector(".images"); // Div used as a container for all the images

			grid: undefined, // this.containers.gallery.querySelector(".grid") // Div used as a container listing all albums with title and thumbnails, organized in a grid(s)
			scroll: undefined, // this.containers.gallery.querySelector(".scroll") // Div used as a container for all the scroll thumbs
			album_navigation: undefined, // this.containers.gallery.querySelector(".album_navigation") // Div used as a container for the album navigation menu
			
			caption: undefined, // this.containers.gallery.querySelector(".caption") // Div used as a container displaying the current image caption
			counter: undefined, // this.containers.gallery.querySelector(".counter") // This container displays the photo counter in fractions
			title: undefined, // this.containers.gallery.querySelector(".title") // Div used as a container displaying the current album title

			progress_bar: undefined, // this.containers.gallery.querySelector(".progress_bar") // Progress bar
			
			appearance_btn: undefined, // this.containers.gallery.querySelector(".appearance_btn") // Toggle appearance mode
			caption_btn: undefined, // this.containers.gallery.querySelector(".caption_btn") // Toggle Caption
			close_btn: undefined, // this.containers.gallery.querySelector(".close_btn") // Close album and gallery
			download_btn: undefined, // this.containers.gallery.querySelector(".download_btn") // Download image
			fscreen_btn: undefined, // this.containers.gallery.querySelector(".fscreen_btn") // Toggle Full screen
			fwindow_btn: undefined, // this.containers.gallery.querySelector(".fwindow_btn") // Toggle Full window
			pause_btn: undefined, // this.containers.gallery.querySelector(".pause_btn") // Play/Pause slideshow

			first_btn: undefined, // this.containers.gallery.querySelector(".first_btn") // Pagination First button
			last_btn: undefined, // this.containers.gallery.querySelector(".last_btn") // Pagination Last button
			next_btn: undefined, // this.containers.gallery.querySelector(".next_btn") // Pagination Next button
			previous_btn: undefined, // this.containers.gallery.querySelector(".previous_btn") // Pagination Previous button

			modal: undefined, // this.containers.gallery.querySelector(".modal") // Lightbox/theater style gallery
			modal_content: undefined, // this.containers.gallery.querySelector(".modal_content") // Content section for modal

			/* Get the documentElement (<html>) to display the page in fullscreen. Eventually change this to allow user to set to specific elements like a div or a section*/
			fscreen: document.documentElement
		};



		// Manage the various status states of the gallery and slideshow options
		this.status = {
			appearance_mode: false,
			caption: false, // Auto show/hide caption (true/false) // User setting
			custom_event: false, // Call external funtion (true/false) // User setting
			display: false, // Auto-display slideshow onload // Always default to false! // User setting
			fscreen: false, // Full screen display onload // Always default to false! // User setting
			fwindow: false, // Full window display onload // Always default to false! // User setting
			loop: false, // Loop status of slideshow // Always default to false! // User setting
			play: false, // Play/Pause status of slideshow // Always default to false! // User setting

			slideshow_interval: undefined, // Slideshow interval
			slideshow_speed: 4500, // Default slideshow speed. Milliseconds: 1000 = 1 second // User setting

			album_index: 0, // Actual Zero index of each album
			album_num: 1, // Actual One index of each album
			img_index: 0, // Actual Zero index of each img
			img_num: 1, // Actual One index of each img

			album_title: undefined, // Current album title
			image_file: undefined, // Current image filename as entered/provided
			image_folder: undefined, // Current directory to image folder as entered/provided
			total_images: undefined, // Current album total images
			total_albums: 0
		};



		// Holds the html markup as it's compiled, then gets inserted into "images/grid/scroll/album_navigation_menu" container(s) via .innerHtml
		this.markup = {
			images: "", // Html markup for the images
			grid: "", // Html markup for the grid thumbnails
			scroll: "", // Html markup for the scroll thumbnails
			album_navigation_menu: "" // Html markup for the album navigation menu
		};



		// Holds the custom html markup provided by designer/developer, then gets inserted into "images/grid/scroll/album_navigation_menu" container(s) via .innerHtml
		this.template = {
			images_wrapper_open: undefined, // Custom html markup for the images wrapper opening // User definable
			images_wrapper_content: undefined, // Custom html markup for the images wrapper content // User definable
			images_wrapper_close: undefined, // Custom html markup for the images wrapper closing // User definable

			grid_wrapper_open: undefined, // Custom html markup for the grid wrapper opening // User definable
			grid_wrapper_content: undefined, // Custom html markup for the grid wrapper content // User definable
			grid_wrapper_close: undefined, // Custom html markup for the grid wrapper closing // User definable

			scroll: undefined, // Custom html markup for scroll thumbnails // User definable

			album_navigation_menu: undefined // Custom html markup for the album navigation menu // User definable
		};



		// All the primary arrays referenced throughout, initally empty
		this.component_array = { // was "object_arrays"
			dbase: [], // Store data (jSon) file
			img: [], // this.containers.images.querySelectorAll(".img") // Array used for all images in the current album
			grid_thb: [], // this.containers.grid.querySelectorAll(".thb") // Array used for all grid thumbs in the current album
			scroll_thb: [] // this.containers.scroll.querySelectorAll(".thb") // Array used for all scroll thumbs in the current album
		};



		// Array of all the main objects listed by name
		this.component_name = [ // was "object_names"
			"images",
			
			"grid",
			"scroll",
			"album_navigation",

			"caption",
			"counter",
			"title",

			"progress_bar",
			
			"appearance_btn",
			"caption_btn",
			"close_btn", 
			"download_btn",
			"fscreen_btn",
			"fwindow_btn",
			"pause_btn",

			"first_btn",
			"last_btn",  
			"next_btn", 
			"previous_btn",

			"modal", 
			"modal_content"		
		];



		// Check if custom options were provided
		if (options.appearance_mode) { this.status.appearance_mode = options.appearance_mode; }
		
		if (options.caption) { this.status.caption = options.caption; }

		if (options.custom_event) { this.status.custom_event = options.custom_event; }

		if (options.display) { this.status.display = options.display; }

		if (options.fscreen) { this.status.fscreen = options.fscreen; }

		if (options.fwindow) { this.status.fwindow = options.fwindow; }

		if (options.loop) { this.status.loop = options.loop; }

		if (options.play) { this.status.play = options.play; }

		if (options.slideshow_speed) { this.status.slideshow_speed = options.slideshow_speed; }



		// Check if custom templates were provided...
		if (options.template) {
			// Images
			if (options.template.images_wrapper_open) { this.template.images_wrapper_open = options.template.images_wrapper_open; }
			
			if (options.template.images_wrapper_content) { this.template.images_wrapper_content = options.template.images_wrapper_content; }
			
			if (options.template.images_wrapper_close) { this.template.images_wrapper_close = options.template.images_wrapper_close; }
			
			// Thumbnails
			if (options.template.grid_wrapper_open) { this.template.grid_wrapper_open = options.template.grid_wrapper_open; }
			
			if (options.template.grid_wrapper_content) { this.template.grid_wrapper_content = options.template.grid_wrapper_content; }
			
			if (options.template.grid_wrapper_close) { this.template.grid_wrapper_close = options.template.grid_wrapper_close; }
			
			// Scroll
			if (options.template.scroll) { this.template.scroll = options.template.scroll; }
			
			// Album navigation
			if (options.template.album_navigation_menu) { this.template.album_navigation_menu = options.template.album_navigation_menu; }
		}



		// Call method to load and parse the gallery database
		this.load_gallery();

	}



	/* Method to load and parse the gallery database
	--------------------------------- */
	load_gallery() {
		// Load and parse gallery database, then call build_gallery method. Otherwise error message(s).
	    const xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = () => { // xmlhttp.onreadystatechange = (eventData) => {
			if (xmlhttp.readyState === 4) {
		        if (xmlhttp.status === 200) {
		          	this.component_array.dbase = JSON.parse(xmlhttp.responseText);
					this.build_gallery();
		        }
		        else {
		           document.write(`<h2>Hello.</h2><p>Unfortunately, an error occured: ${ xmlhttp.statusText }.</p>`);
		        }
		    }
		};

		// If no directory or directory is empty, error. Otherwise proceed...
		if (!this.info.directory || this.info.directory === "") {
			document.write("<h2>Hello.</h2><p>Unfortunately, the gallery directory file cannot be loaded at this time.</p>");
		}
		else {
			xmlhttp.open("GET", `${ this.info.directory }?t=${ Math.random() }`); // Math.random prevents caching imported gallery database
			xmlhttp.send();
		}
	}



	/* Method to build the gallery
	--------------------------------- */
	build_gallery() {
		// Make sure a gallery name was provided and it's corresponding container exists
		if (!this.info.name || this.info.name === "" || !document.querySelector(`.${ this.info.name }`)) {
			document.write("<h2>Hello.</h2><p>Unfortunately, the gallery name or container is not available at this time.</p>");
		}
		// Make sure an images container exists within the main gallery container
		else if (!document.querySelector(`.${ this.info.name }`).querySelector(".images")) {
			document.write("<h2>Hello.</h2><p>Unfortunately, the gallery images container is not available at this time.</p>");
		}
		// If all is good, move forward with building the gallery
		else {
			// Set a container to both gallery and images
			this.containers.gallery = document.querySelector(`.${ this.info.name }`);
			this.containers.images = document.querySelector(`.${ this.info.name }`).querySelector(".images");



			// Check to see which components exists in html markup. If so, associate each with a respective object in the gallery class
			this.component_name.forEach((obj) => { /* element, index, array */
				if (this.containers.gallery.querySelector(`.${ obj }`)) { this.containers[obj] = this.containers.gallery.querySelector(`.${ obj }`); }
	   		});



	   		// Process json gallery database, parsed from load_gallery(), and assign to default or custom markup.
			this.component_array.dbase.forEach((element) => { /* element, index, array */

				if (!element[0].album || element[0].album === "" || 
		    		!element[0].img_folder || element[0].img_folder === "" || 
		    		!element.length || element.length === "") {
					
					document.write("<h2>Hello.</h2><p>Unfortunately, the album is unable to build at this time.</p>");
				}
				else {

					this.status.album_num = element[0].album;
					this.status.album_title = element[0].title;
					this.status.image_folder = element[0].img_folder;
					this.status.total_images = element.length;
					this.status.total_albums++;

				    // Name each div class based on respective album name and append it to the correct markup location
					this.markup.images += `<div class='album_${ this.status.album_num }'>`;

					if (this.containers.grid) { this.markup.grid += `<div class='album_${ this.status.album_num }'>`; }

					if (this.containers.scroll) { this.markup.scroll += `<div class='album_${ this.status.album_num }'>`; }



						// START CUSTOM TEMPLATE CHECK ---------------

							this.template_check_1(element); // Check if custom templates were provided for images, grid, or scroll

						// END CUSTOM TEMPLATE CHECK ---------------



					// Close out the automated html markup with necessary div's, etc.
					this.markup.images += "</div>";
					
					if (this.containers.grid) { this.markup.grid += "</div>"; }

					if (this.containers.scroll) { this.markup.scroll += "</div>"; }
				}
			});



			// Print automated html markup to the corresponding div
			this.containers.images.innerHTML = this.markup.images;

			if (this.containers.grid) { this.containers.grid.innerHTML = this.markup.grid; }	

			if (this.containers.scroll) { this.containers.scroll.innerHTML = this.markup.scroll; }



			// Clear the progress bar percentage, counter, title, and caption fields on build
			if (this.containers.progress_bar) { this.containers.progress_bar.querySelector("span").innerHTML = ""; }
			if (this.containers.counter) { this.containers.counter.innerHTML = ""; }
			if (this.containers.title) { this.containers.title.innerHTML = ""; }
			if (this.containers.caption) { this.containers.caption.innerHTML = ""; }



			// If modal is included, set its display to none by default, and body overflow to auto
			if (this.containers.modal) { 
				this.containers.modal.style.display = "none";
				document.querySelector("body").style.overflow = "auto";
			}



			// Create album navigation menu items / Check if custom templates were provided for album navigation
			if (this.containers.grid || this.containers.scroll || this.containers.album_navigation) { this.template_check_2(); }
		}
	}



	/* Check if custom templates were provided for images, grid, or scroll. Otherwise default markup will be used
	--------------------------------- */
	template_check_1(element) {
		
		// Build opening wrapper under each album. First see if a template is privided
		this.component_name.forEach((obj) => { /* element, index, array */

			if (obj === "images" || 
				obj === "grid") {

				let wrapper_open = obj + "_wrapper_open";
				if (this.template[wrapper_open]) {
					this.markup[obj] += this.template[wrapper_open](element, this.status.album_num, this.status.album_title, this.status.image_folder, this.status.total_images);
				}
				// Else no template, use default markup
				else {
					if (obj === "images") { this.markup.images += "<div>"; }
					
					if (obj === "grid") { this.markup.grid += `<h4>${ this.status.album_title }</h4>`; }
				}
			}
	    });



	    // Build images and grid/scroll thumbnails for each album
		for (let i = 1; i < this.status.total_images; i++) {
			// Designate the current image file
			this.status.image_file = element[i].img; // portfolio.info.dbase[0][1].img // Grab image to be displayed


			if (!this.status.image_file || this.status.image_file === "") {
				document.write("<h2>Hello.</h2><p>Unfortunately, the gallery is unable to build thumbnails and/or images at this time.</p>");
			}
			else {

				this.component_name.forEach((obj) => { /* element, index, array */

					if (obj === "images" || 
						obj === "grid" ||
						obj === "scroll") {



						let wrapper_content = "";

						if (obj === "scroll") { wrapper_content = "scroll"; }
						else { wrapper_content = obj + "_wrapper_content"; }



						// Build content for each object. First see if a template is privided
						if (this.template[wrapper_content]) {
				            this.markup[obj] += this.template[wrapper_content](i, element, this.status.album_num, this.status.album_title, this.status.image_folder, this.status.image_file, this.status.total_images);
			        	}
			        	// Else no template, use default markup
			        	else { 
			        		// Build default content for each image
			        		if (obj === "images") { this.markup.images += `<img class='img' data-src='${ this.status.image_folder + this.status.image_file }' src='img/spinner.gif'>`; }
							
							// Build content for each thumbnail in the grid wrapper content
							if (obj === "grid") { this.markup.grid += `<button type='button' class='thb i_${ i }'>${ i }</button>`; }
							
							// Build content for each thumbnail in the pagination scroll
							if (obj === "scroll") { this.markup.scroll += `<button type='button' class='thb i_${ i }'>${ i }</button>`; }
						}

					}
			    });
			}
		}



		// Build closing wrapper under each album in images. First see if a template is privided
		this.component_name.forEach((obj) => { /* element, index, array */

			if (obj === "images" || 
				obj === "grid") {

				let wrapper_close = obj + "_wrapper_close";
				if (this.template[wrapper_close]) {
					this.markup[obj] += this.template[wrapper_close];
				}
				// Else no template, use default markup
				else {
					if (obj === "images") { this.markup.images += "</div>"; }

					if (obj === "grid") { this.markup.grid += "</div>"; }
				}
			}
	    });

	}



	/* Check if custom templates were provided for album navigation. Otherwise default markup will be used
		// Then call add_event_listeners() to add all addEventListeners
	--------------------------------- */
	template_check_2() {
		if (this.containers.album_navigation) { this.markup.album_navigation_menu = '<div class="dropdown_content">'; }



	    this.component_array.dbase.forEach((element) => { /* element, index, array */
	    	this.status.album_num = element[0].album;
	    	this.status.album_title = element[0].title;
	    	this.status.total_images = element.length;

			if (this.containers.album_navigation) {
				// START CUSTOM TEMPLATE CHECK ---------------

				if (this.template.album_navigation_menu) { this.markup.album_navigation_menu += this.template.album_navigation_menu(this.status.album_num, this.status.album_title); }
			    // Else no template, use default markup
				else { this.markup.album_navigation_menu += `<button class='n_${ this.status.album_num }'>${ this.status.album_title }</button>`; }

		    	// END CUSTOM TEMPLATE CHECK ---------------
		    }

		    // Image and scroll albums should be set to display none til requested
			if (this.containers.images.querySelector(`.album_${ this.status.album_num }`)) { this.containers.images.querySelector(`.album_${ this.status.album_num }`).style.display = "none"; }
			
			if (this.containers.scroll && this.containers.scroll.querySelector(`.album_${ this.status.album_num }`)) { this.containers.scroll.querySelector(`.album_${ this.status.album_num }`).style.display = "none"; }
	    });



		if (this.containers.album_navigation) {
		    this.markup.album_navigation_menu += '</div>';

			// Print automated html markup to the respective div
			this.containers.album_navigation.innerHTML += this.markup.album_navigation_menu;
		}


		window.addEventListener('load', this.add_event_listeners());
			
		if (this.status.custom_event) { window.custom_event(); }
	}



	/* Now that the gallery build is complete, call all Event Listeners for thumbnails, slideshow buttons, keyboard controls, etc
	--------------------------------- */
	add_event_listeners() {
		this.component_array.dbase.forEach((element) => { /* element, index, array */
	    	this.status.album_num = element[0].album;
	    	this.status.album_title = element[0].title;
	    	this.status.total_images = element.length;



	    	// Add event listeners to all thumbnails.
			for (let i = 1; i < this.status.total_images; i++) {
	    		if (this.containers.grid) { this.thb_listeners(this.containers.grid, this.status.album_num, i); }

				if (this.containers.scroll) { this.thb_listeners(this.containers.scroll, this.status.album_num, i); }
			}



			// Add event listeners to album navigation menu items
			if (this.containers.album_navigation) { this.album_listeners(this.containers.album_navigation, this.status.album_num); }
	    });



		// Add Event Listeners to slideshow buttons
		this.btn_listeners();



		// Add Event Listeners for keyboard controls
		this.keydown_listeners();



		// Add Listeners for basic mobile device swipe functionality 
		this.swipe_listeners();



		// If Toggle caption option is enabled, activate it.
		if (this.status.caption) { this.toggle_caption(); }
		


		// If Toggle full window option is enabled, activate it.
		if (this.status.fwindow) { this.toggle_fwindow(); }



		// If "appearance_mode" option is enabled, activate it.
		if (this.status.appearance_mode) { this.toggle_appearance(); }



		// If "display" option is enabled, open slideshow by default now that the gallery is built
		if (this.status.display) { this.open_gallery(1, 1); }

	}



	/* Event Listeners for thumbnails
	--------------------------------- */
	thb_listeners(obj, album_num, t) {
		obj.querySelector(`.album_${ album_num }`).addEventListener('click', (e) => {
		    // But only for elements that have an i_t class
		    if (e.target.classList.contains(`i_${ t }`)) {
				//alert(e.target.innerHTML);
				this.slideshow_pause(); 
				this.open_gallery(album_num, t);
				// If Toggle full screen option is enabled, activate it.
				if (this.status.fscreen) { this.toggle_fscreen(); }
			}
		});
	}



	/* Event Listeners for album menu options
	--------------------------------- */
	album_listeners(obj, album_num) {
		obj.querySelector(`.n_${ album_num }`).addEventListener('click', (/*e*/) => {
		    // But only for elements that have an i_t class
		    //if (e.target.classList.contains(`i_${ t }`)) {
				//alert(e.target.innerHTML);
				this.containers.album_navigation.querySelector(".dropdown_content").classList.remove("active");
				this.slideshow_pause(); 
				this.open_gallery(album_num, 1);
			//}
		});
	}



	/* Event Listeners for all gallery buttons
	--------------------------------- */
	btn_listeners() {
		this.component_name.forEach((obj) => { /* element, index, array */

			if (obj === "images" ||

				obj === "appearance_btn" ||
				obj === "caption_btn" || 
				obj === "close_btn" ||
				obj === "download_btn" ||
				obj === "fscreen_btn" ||
				obj === "fwindow_btn" || 
				obj === "pause_btn" || 

				obj === "first_btn" || 
				obj === "last_btn" || 
				obj === "next_btn" ||
				obj === "previous_btn" ||

				obj === "modal") {

				if (this.containers.gallery.querySelector(`.${ obj }`)) {
					this.containers.gallery.querySelector(`.${ obj }`).addEventListener("click", () => {
						// event.preventDefault(); // Cancel the native event
						// event.stopPropagation(); // Don't bubble/capture the event any further

						// Toggle appearance mode
						if (obj === "images" && this.containers.album_navigation) { 

							if (this.containers.album_navigation.querySelector(".dropdown_content").classList.contains("active")) {
								this.containers.album_navigation.querySelector(".dropdown_content").classList.remove("active");
							}

						}

						// Toggle appearance mode
						if (obj === "appearance_btn" && this.containers.appearance_btn) { this.toggle_appearance(); }

						// Toggle Caption
						if (obj === "caption_btn" && this.containers.caption_btn) { this.toggle_caption(); }

						// Close gallery
						if (obj === "close_btn" && this.containers.close_btn) {
					    	if (this.containers.modal && this.containers.modal.style.display === "block") { this.close_gallery(); }
						}

						// Download button
						if (obj === "download_btn" && this.containers.download_btn) { this.download_image(); }

						// Toggle fullscreen
						if (obj === "fscreen_btn" && this.containers.fscreen_btn) { this.toggle_fscreen(); }

						// Toggle fullwindow
						if (obj === "fwindow_btn" && this.containers.fwindow_btn) { this.toggle_fwindow(); }

						// Play/Pause slideshow
						if (obj === "pause_btn" && this.containers.pause_btn) {
					    	if (this.status.play) { this.slideshow_pause(); }
							else { this.slideshow_play(); }
						}

						// Go to First image
						if (obj === "first_btn" && this.containers.first_btn) { this.set_img_status(this.status.img_num = 1); }
					
						// Go to Last image
						if (obj === "last_btn" && this.containers.last_btn) { this.set_img_status(this.status.img_num = this.status.total_images); }

						// Go to Next image
						if (obj === "next_btn" && this.containers.next_btn) { this.set_img_status(this.status.img_num++); }

						// Go to Previous image
						if (obj === "previous_btn" && this.containers.previous_btn) { this.set_img_status(this.status.img_num--); }

						// Modal click to close slideshow
					    if (obj === "modal" && this.containers.modal) {  		
					   		// When the user clicks anywhere outside of the modal, close it
					   		if (event.target === this.containers.modal) { this.close_gallery(); }
						}

					});
				}
			}
	    });



		this.containers.album_navigation.querySelector(".dropdown_btn").addEventListener("click", () => {
			if (this.containers.album_navigation.querySelector(".dropdown_content").classList.contains("active")) {
				this.containers.album_navigation.querySelector(".dropdown_content").classList.remove("active");
			}
			else {
				this.containers.album_navigation.querySelector(".dropdown_content").classList.add("active");
			}
		});
	}



	/* Keydown Listeners for keyboard controls
	--------------------------------- */
	keydown_listeners() {
		// KeyDown event listener 
		document.addEventListener("keydown", event => {
			if (this.containers.modal && this.containers.modal.style.display === "block") {
				/*if (this.containers.modal && this.containers.modal.style.display === "block") {*/
					if (event.key === 'Escape' || event.code === 'Escape' || event.keyCode === 27) {
						event.preventDefault(); // Cancel the native event
							event.stopPropagation(); // Don't bubble/capture the event any further
						this.close_gallery();
					}
				/*}*/

				if (this.containers.pause || this.containers.scroll) {
					if (event.key === 'ArrowLeft' || event.code === 'ArrowLeft' || event.keyCode === 37) {
						event.preventDefault(); // Cancel the native event
							event.stopPropagation(); // Don't bubble/capture the event any further

						if (this.status.img_num === 1) { this.status.img_num = this.status.total_images; }
						else { this.status.img_num--; }
						
						this.set_img_status();
					}
					if (event.key === 'ArrowRight' || event.code === 'ArrowRight' || event.keyCode === 39 || event.key === 'Enter' || event.code === 'Enter' || event.keyCode === 13) {
						event.preventDefault(); // Cancel the native event
							event.stopPropagation(); // Don't bubble/capture the event any further

						this.status.img_num++;

						this.set_img_status();
					}
					if (event.key === ' ' || event.code === 'Space' || event.keyCode === 32) {
						event.preventDefault(); // Cancel the native event
							event.stopPropagation(); // Don't bubble/capture the event any further

						if (this.status.play) { this.slideshow_pause(); }
						else { this.slideshow_play(); }
					}
				}
				return false;
			}
		});
	}



	/* Enables basic swipe functionality for image navigation on mobile devices
	--------------------------------- */
	swipe_listeners() {
		let touch_start_X = 0;
		let touch_end_X = 0;
		    
		let check_direction = () => {
			if (touch_end_X < touch_start_X) {
			  	if (this.status.img_num === 1) { this.status.img_num = this.status.total_images; }
				else { this.status.img_num--; }

				this.set_img_status();
			}
														
		  	if (touch_end_X > touch_start_X) {
		  		this.status.img_num++;
				this.set_img_status();
			}
		}

		this.containers.images.addEventListener('touchstart', (e) => {
		  touch_start_X = e.changedTouches[0].screenX;
		});

		this.containers.images.addEventListener('touchend', (e) => {
		  touch_end_X = e.changedTouches[0].screenX;
		  check_direction();
		});
	}



	/* Toggle Appearance mode
	--------------------------------- */
	toggle_appearance() {
		if (this.status.appearance_mode && this.containers.appearance_btn.classList.contains("active")) {
			this.containers.appearance_btn.classList.remove("active");

			this.containers.fscreen.style.setProperty('--white', '#FFFFFF');
		 	this.containers.fscreen.style.setProperty('--white_alpha', 'rgba(255,255,255,0.9)');
		 	this.containers.fscreen.style.setProperty('--black', '#000000');
		 	this.containers.fscreen.style.setProperty('--color_1', '#2E9AFE');
		 	this.containers.fscreen.style.setProperty('--color_2', '#F79F81');
		 	this.containers.fscreen.style.setProperty('--color_3', '#848484');
		 	this.containers.fscreen.style.setProperty('--color_4', '#F2F2F2');
		 	this.containers.fscreen.style.setProperty('--charcoal', '#1A1A1A');

		 	this.status.appearance_mode = false; // then reset
		} else {
			this.containers.appearance_btn.classList.add("active");

		    this.containers.fscreen.style.setProperty('--white', '#000000');
		    this.containers.fscreen.style.setProperty('--white_alpha', 'rgba(0,0,0,0.9)');
		    this.containers.fscreen.style.setProperty('--black', '#FFFFFF');
		    this.containers.fscreen.style.setProperty('--color_1', '#F79F81');
		 	this.containers.fscreen.style.setProperty('--color_2', '#2E9AFE');
		    this.containers.fscreen.style.setProperty('--color_3', '#F2F2F2');
		 	this.containers.fscreen.style.setProperty('--color_4', '#1A1A1A');
		 	this.containers.fscreen.style.setProperty('--charcoal', '#F2F2F2');

		    this.status.appearance_mode = true; // then reset
		}
	}



	/* Toggle caption
	--------------------------------- */
	toggle_caption() {
		if (this.status.caption && this.containers.caption_btn.classList.contains("active")) {
	    	
    		this.containers.caption.classList.remove("active");
    		this.containers.caption_btn.classList.remove("active");
    		this.status.caption = false;
    	}
		else { 
			this.containers.caption.classList.add("active");
			this.containers.caption_btn.classList.add("active");
			this.status.caption = true; 
		}
	}



	/* Close and deactivate "current" (previous) image and respective thb
	--------------------------------- */
	close_active() {
		
		if (this.containers.images.querySelector(".active")) {
			this.containers.images.querySelector(".active").classList.remove('active');
		}
	


		if (this.containers.grid) {
			if (this.containers.grid.querySelector(".active")) {
				this.containers.grid.querySelector(".active").disabled = false;
				this.containers.grid.querySelector(".active").classList.remove('active');
				
			}
		}

		

		if (this.containers.scroll) {
			if (this.containers.scroll.querySelector(".active")) {
				this.containers.scroll.querySelector(".active").disabled = false;
				this.containers.scroll.querySelector(".active").classList.remove('active');
				
			}
		}
	}



	/* Close active album
	--------------------------------- */
	close_album() {
		
		if (this.containers.images.querySelector(`.album_${ this.status.album_num }`)) {	
			this.containers.images.querySelector(`.album_${ this.status.album_num }`).style.display = "none";
		}

		// If a previous scroll album exists, remove it from view 
		if (this.containers.scroll && this.containers.scroll.querySelector(`.album_${ this.status.album_num }`)) {	
			this.containers.scroll.querySelector(`.album_${ this.status.album_num }`).style.display = "none";
		}

	}



	/* Close gallery
	--------------------------------- */
	close_gallery() {
		
		this.close_active();

		this.close_album();		

		if (this.containers.modal) {
			this.containers.modal.style.display = "none";
			document.querySelector("body").style.overflow = "auto";
		}

		

		if (this.status.play) { this.slideshow_pause(); }
	}



	/* Download current image via popout window: optional php solution coming soon
	--------------------------------- */
	download_image() {window.open(this.containers.images.querySelector(`.album_${ this.status.album_num }`).querySelector(".active").getAttribute("src"), "_blank", "width=" + (parseInt(window.innerWidth) * 0.2) + ",height=" + (parseInt(window.innerHeight) * .2));}



	/* Toggle Fullscreen
	--------------------------------- */
	toggle_fscreen() {
		if (this.status.fscreen && this.containers.fscreen_btn.classList.contains("active")) {
			this.containers.fscreen_btn.classList.remove("active");

			this.containers.modal_content.classList.remove("fullscreen");
			/*this.containers.gallery.querySelector(".slideshow").classList.remove("fullscreen");
			document.body.classList.remove("fullscreen");*/

			// If scroll buttons are enabled, but temporarily de-activated...re-activate their functionality on exit fullscreen.
			if (this.containers.gallery.querySelector(".scroll")) {
				const obj = this.containers.gallery.querySelector(".scroll");
			    obj.style.opacity = '100%';
				obj.style.pointerEvents = 'auto';
				obj.style.cursor = 'pointer';
			}

			if (document.exitFullscreen) { document.exitFullscreen(); } 
			else if (document.webkitExitFullscreen) { /* Safari */ document.webkitExitFullscreen(); } 
			else if (document.msExitFullscreen) { /* IE11 */ document.msExitFullscreen(); }

			this.status.fscreen = false;
		}
		else {
			this.containers.fscreen_btn.classList.add("active");

			this.containers.modal_content.classList.add("fullscreen");
			/*this.containers.gallery.querySelector(".slideshow").classList.add("fullscreen");
			document.body.classList.add("fullscreen");*/

			// If scroll buttons are enabled, temporarily de-activate their functionality during fullscreen.
			if (this.containers.gallery.querySelector(".scroll")) {
				const obj = this.containers.gallery.querySelector(".scroll");
			    obj.style.opacity = '30%';
				obj.style.pointerEvents = 'none';
				obj.style.cursor = 'default';
			}
			

			if (this.containers.fscreen.requestFullscreen) { this.containers.fscreen.requestFullscreen(); } 
			else if (this.containers.fscreen.webkitRequestFullscreen) { /* Safari */ this.containers.fscreen.webkitRequestFullscreen(); } 
			else if (this.containers.fscreen.msRequestFullscreen) { /* IE11 */ this.containers.fscreen.msRequestFullscreen(); }

			this.status.fscreen = true;
		}
	}



	/* Toggle full window
	--------------------------------- */
	toggle_fwindow() {
		if (this.status.fwindow && this.containers.fwindow_btn.classList.contains("active")) {
			this.containers.fwindow_btn.classList.remove("active"); 
    		this.containers.modal_content.style.width = "600px";

    		this.status.fwindow = false; // then reset
	    }
		else { 
			this.containers.fwindow_btn.classList.add("active"); 
			this.containers.modal_content.style.width = "100%";

			this.status.fwindow = true; // then reset
		}
	}



	/* Pause Slideshow
	--------------------------------- */ 
	slideshow_pause() {
		/* The below "if .counter" is not necessarily needed, but does allow for custom text in ".counter" when slideshow is paused, so will prob set this up as a user defined option */
		/*if (this.containers.counter) {
			this.containers.counter.innerHTML =  `${ this.status.img_num } / ${ this.component_array.img.length }`;
		}*/

		// If scroll, first, previous, next, and/or last buttons are enabled, re-activate their functionality now that slidehsow is paused.
		this.component_name.forEach((obj) => { /* element, index, array */
			if (obj === "first_btn" || 
				obj === "last_btn" || 
				obj === "next_btn" || 
				obj === "previous_btn" ||
				obj === "scroll") {

				if (this.containers.gallery.querySelector(`.${ obj }`)) {
					obj = this.containers.gallery.querySelector(`.${ obj }`);
				    obj.style.opacity = '100%';
					obj.style.pointerEvents = 'auto';
					obj.style.cursor = 'pointer';
				}
			}
	    });


		clearInterval(this.status.slideshow_interval);

		this.status.play = false;

		// Print automated html markup to the respective div
		if (this.containers.pause_btn) {	
			//this.containers.pause.innerHTML = 'Play';
			this.containers.pause_btn.classList.remove('active');
		}
	}



	/* Play Slideshow
	--------------------------------- */
	slideshow_play() {
		/* The below "if .counter" is not necessarily needed, but does allow for custom text in ".counter" when slideshow play has started/resumed, so will prob set this up as a user defined option */
		/*if (this.containers.counter) {
			this.containers.counter.innerHTML = this.containers.counter.innerHTML;
		}*/

		// If scroll, first, previous, next, and/or last buttons are enabled, temporarily de-activate their functionality during slidehow play. Then adjust setInterval.
		this.component_name.forEach((obj) => { /* element, index, array */
			if (obj === "first_btn" || 
				obj === "last_btn" || 
				obj === "next_btn" || 
				obj === "previous_btn" ||
				obj === "scroll") {

				if (this.containers.gallery.querySelector(`.${ obj }`)) {
					obj = this.containers.gallery.querySelector(`.${ obj }`);
				    obj.style.opacity = '30%';
					obj.style.pointerEvents = 'none';
					obj.style.cursor = 'default';
				}
			}
	    });


		this.status.slideshow_interval = setInterval(() => this.set_img_status(this.status.img_num++), this.status.slideshow_speed); // set_speed.

		this.status.play = true;

		// Print automated html markup to the respective div
		if (this.containers.pause_btn) {
			//this.containers.pause.innerHTML = 'Pause';
			this.containers.pause_btn.classList.add('active');
		}
	}



	/* Open gallery
	--------------------------------- */
	open_gallery(a, i) { // a: album, i: image
		// bodyScroll.freeze();
		// site_navigation.classList.remove('active');

		// Then make sure only one grid thumbnail is active at a time by deactiving current selection
		// And only one scroll thumbnail is active at a time by deactiving current selection
		this.close_active();



		// Each time the open_gallery is called, make sure the previous album is "closed" first
		// This is for when the close_gallery function wasn't called before a new image was selected
		// If a previous scroll album exists, remove it from view
		this.close_album();
		


		// Set general opts
		this.status.album_num = a;
		this.status.album_index = this.status.album_num - 1;
		this.status.img_num = i;



		if (!this.status.album_num || this.status.album_num === "") {
			document.write("<h2>Hello.</h2><p>Unfortunately, the gallery is unable to open at this time.</p>");
		}
		else {

			// Gather all img's in the current album, then total them up
			this.component_array.img = this.containers.images.querySelector(`.album_${ this.status.album_num }`).querySelectorAll(".img");

			this.status.total_images = this.component_array.img.length;


			// Gather all thb's in the current album grid
			if (this.containers.grid) {
				this.component_array.grid_thb = this.containers.grid.querySelector(`.album_${ this.status.album_num }`).querySelectorAll(".thb");
			}

			// Gather all thb's in the current album scroll
			if (this.containers.scroll) {
				this.component_array.scroll_thb = this.containers.scroll.querySelector(`.album_${ this.status.album_num }`).querySelectorAll(".thb");
			}

			// Open current album
			if (this.containers.images.querySelector(`.album_${ this.status.album_num }`).style.display === "none") {
				this.containers.images.querySelector(`.album_${ this.status.album_num }`).style.display = "block";
			}

			if (this.containers.scroll && this.containers.scroll.querySelector(`.album_${ this.status.album_num }`)) {
				if (this.containers.scroll.querySelector(`.album_${ this.status.album_num }`).style.display === "none") {
					this.containers.scroll.querySelector(`.album_${ this.status.album_num }`).style.display = "block";
				}
			}

			// Set album navigation button state
			if (this.containers.album_navigation) {
		    	if (this.containers.album_navigation.querySelector(".dropdown_content .active")) {
		    		let previous_nav_link = this.containers.album_navigation.querySelector(".dropdown_content .active");
		    		previous_nav_link.classList.remove('active');
		    	}
		    	let current_nav_link = this.containers.album_navigation.querySelector(`.n_${ this.status.album_num }`);
		    	current_nav_link.classList.add('active');
		    }

			// Set current album title
			if (this.containers.title) {
				// Print automated html markup to the respective div
				this.containers.title.innerHTML = `<h2>${ this.info.name }</h2>` +
													`<h3>${ this.component_array.dbase[this.status.album_index][0].title }</h3>`;
			}

			// Is auto-play enabled?
			if (this.status.play) {
				this.status.img_num = 1; // On open (if auto-play is enabled)
				this.set_img_status();
				this.slideshow_play();
			}
			else {
				this.set_img_status(); // Default
			}
		}
	}



	/* Check/set current img number, then set img_index for updated current image/thumb number, before calling show_current_img
	--------------------------------- */ 
	set_img_status() {
		// Check value of img_num and adjust as needed to allow loop functionality 
		if (this.status.img_num > this.status.total_images ) { this.status.img_num = 1; }
		if (this.status.img_num < 1) { this.status.img_num = this.status.total_images; }

		// Set value of img_index, then call method show_current_img
		this.status.img_index = this.status.img_num - 1;
		
		this.show_current_img();
	}



	/* Method to display current img, thumb and related info, as well as set stats, progress, and active album_navigation_button state
	--------------------------------- */ 
	load_current_img() {

		// Lazy load image to src from data-src and set container visibility, then set current grid_thb and scroll_thb to active state
		const get_image = (new_img_url) => {
	        return new Promise((resolve, reject) => {
	            var new_img = new Image();
	            new_img.onload = () => {
	                resolve(new_img_url);
	            }
	            new_img.onerror = () => {
	                reject(new_img_url);
	            }
	            new_img.src = new_img_url;
	        });
	    }

	    get_image(this.component_array.img[this.status.img_index].getAttribute('data-src')).then((resolve) => {
	    	if (this.containers.images.querySelector(".error")) {
				//this.containers.images.style.marginTop = "auto";
				this.containers.images.querySelector(".error").remove();
			}
			
		    //do stuff
		    this.component_array.img[this.status.img_index].style.width = "100%";
			this.component_array.img[this.status.img_index].style.height = "100%";
			this.component_array.img[this.status.img_index].style.marginTop = "0px";
			this.component_array.img[this.status.img_index].style.boxShadow = "var(--shadow)";
			this.component_array.img[this.status.img_index].setAttribute('src', resolve); // resolve / this.component_array.img[this.status.img_index].getAttribute('data-src')

			//this.component_array.img[this.status.img_index].classList.add('active'); // style.display = "block";
			//this.containers.images.style.display = "block";

		}).catch((reject) => {
			//do stuff
			//this.containers.images.style.marginTop = "-100px";
			if (this.containers.images.querySelector(".error")) {
				//this.containers.images.style.marginTop = "auto";
				this.containers.images.querySelector(".error").remove();
			}

			const error_msg = document.createElement("p");
			error_msg.className = "error";
			//error_msg.innerHTML = this.containers.caption.innerHTML + "<br>(Image not available at this time.)";
			error_msg.innerHTML = "Image not available at this time.<br>" + reject;
			this.containers.images.appendChild(error_msg);

			if (this.component_array.img[this.status.img_index].classList.contains('active')) {
				this.component_array.img[this.status.img_index].classList.remove('active');
			}
			//this.component_array.img[this.status.img_index].style.display = "none";
		
		}).finally(() => {
			//do stuff
			this.component_array.img[this.status.img_index].setAttribute('alt', this.containers.caption.innerHTML); 
			/*this.component_array.img[this.status.img_index].style.display = "block";*/
		});

	}

	

	/* Method to display current img, thumb and related info, as well as set stats, progress, and active album_navigation_button state
	--------------------------------- */ 
	show_current_img() {
		// Hide all images and deactivate all grid_thb and scroll_thb in current album to ensure only one is open/active at a time.
		this.close_active();

		this.component_array.img[this.status.img_index].classList.add('active'); // style.display = "block"; // moved to here from line 1219 allowing the preloader to show as needed

		/*if (this.containers.pause) {

			// Print automated html markup to the respective div
			if (this.status.play) {
			  	this.containers.pause.innerHTML = 'Pause';
			}
			else {
				this.containers.pause.innerHTML = 'Play';
			}
		}*/


		// Print automated html markup to the respective div
		if (this.containers.counter) {
			this.containers.counter.innerHTML = `${ this.status.img_num } / ${ this.status.total_images }`;
		}

		if (this.containers.caption) {	
			this.containers.caption.innerHTML = this.component_array.dbase[this.status.album_index][this.status.img_num].caption;

			if (this.status.caption) {
				this.containers.caption.classList.add("active");
			}
		}


		// Set current progress
		let width = Math.round((this.status.img_num / this.status.total_images) * 100);
		if (this.containers.progress_bar) {
			if (width >= 100) {
				//let i = 0;
				this.containers.progress_bar.style.width = 0 + "%";

				// Print automated html markup to the respective div
		    	this.containers.progress_bar.querySelector("span").innerHTML = 0 + " %";
			} else {
				this.containers.progress_bar.style.width = width + "%";

				// Print automated html markup to the respective div
		    	this.containers.progress_bar.querySelector("span").innerHTML = width + " %";
			}
		}



		this.load_current_img();



		if (this.containers.grid) {
			this.component_array.grid_thb[this.status.img_index].classList.add('active');
			this.component_array.grid_thb[this.status.img_index].disabled = true;
		}

		if (this.containers.scroll) {
			this.component_array.scroll_thb[this.status.img_index].classList.add('active');
			this.component_array.scroll_thb[this.status.img_index].disabled = true;
		}

		if (!this.status.play) {
			if (this.containers.first_btn) {
				this.containers.first_btn.style.opacity = '100%';
				this.containers.first_btn.style.pointerEvents = 'auto';
				this.containers.first_btn.style.cursor = 'pointer';
			}

			if (this.containers.last_btn) {
				this.containers.last_btn.style.opacity = '100%';
				this.containers.last_btn.style.pointerEvents = 'auto';
				this.containers.last_btn.style.cursor = 'pointer';
			}
		}
		
		// Set state of first and last pagination buttons
        if (this.status.img_num === 1) {
        	if (!this.status.play) {
        		if (this.containers.first_btn) {
	            	this.containers.first_btn.style.opacity = '30%';
					this.containers.first_btn.style.pointerEvents = 'none';
					this.containers.first_btn.style.cursor = 'default';
				}
			}
        }
        else if (this.status.img_num === this.status.total_images) {
        	if (!this.status.play) {
        		if (this.containers.last_btn) {
	            	this.containers.last_btn.style.opacity = '30%';
					this.containers.last_btn.style.pointerEvents = 'none';
					this.containers.last_btn.style.cursor = 'default';
				}
			}
	
			// If a progress bar was to be used, set it to max
			if (this.containers.progress_bar) {
				this.containers.progress_bar.style.width = 100 + "%";

				// Print automated html markup to the respective div
		    	this.containers.progress_bar.querySelector("span").innerHTML = 100 + " %";
			}

			// Check if slideshow is set to loop
			if (!this.status.loop) {
				this.slideshow_pause();
			}
        }



        // Show modal/modal_content
		if (this.containers.modal && this.containers.modal.style.display === "none") {
			this.containers.modal.style.display = "block";
			document.querySelector("body").style.overflow = "hidden";
		}


		// Set scroll position
		if (this.containers.scroll) {
			this.component_array.scroll_thb[this.status.img_index].scrollIntoView({behavior: "smooth", block: "start", inline: "center"});
		}
	}

}
