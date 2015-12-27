
"use strict";
$(function() {
 
    Parse.$ = jQuery;
 
    // Replace this line with the one on your Quickstart Guide Page
    Parse.initialize("e1hTjOylez6LD007TtrLKCIfGXMNWxfSaSEJ6JSP", "dMobJdcZ9ZGKtm4FRJP1jteP1CnsKKqgGKhQRsPi");

	var Blog = Parse.Object.extend('Blog', {
		create: function(title, content) {
			this.set({
				'Title': title,
				'Content': content,
				'author': Parse.User.current(),
				'authorName': Parse.User.current().get('username'),
				'time':new Date().toDateString()
			}).save(null, {
				success: function(blog) {
					alert('You added a new blog: ' + blog.get('Title'));
				},
				error: function(blog, error) {
					console.log(blog);
					console.log(error);
				}
			});
		},
		update: function(title, content) {
			this.set({
				'Title': title,
				'Content': content
			}).save(null, {
				success: function(blog) {
					alert('Your blog ' + blog.get('Title') + ' has been saved!');
				},
				error: function(blog, error) {
					console.log(blog);
					console.log(error);
				}
			});
		}
	});
	var Blogs = Parse.Collection.extend({
			model: Blog
	});
	
	var BlogsAdminView = Parse.View.extend({
			template: Handlebars.compile($('#blogs-admin-tpl').html()),
			events:{
				'click .app-edit': 'edit'
			},
			edit: function(e){
				e.preventDefault();
				var href =$(e.target).attr('href');
				blogRouter.navigate(href,{trigger:true});
			},
			render: function() {
				var collection = { blog: this.collection.toJSON() };
				this.$el.html(this.template(collection));
			}
		}),
		LoginView = Parse.View.extend({
			template: Handlebars.compile($('#login-tpl').html()),
			events: {
				'submit .form-signin': 'login'
			},
			login: function(e) {
		  		// Prevent Default Submit Event
				e.preventDefault();
		 
				// Get data from the form and put them into variables
				var data = $(e.target).serializeArray(),
					username = data[0].value,
					password = data[1].value;
		 
				// Call Parse Login function with those variables
				Parse.User.logIn(username, password, {
					// If the username and password matches
					success: function(user) {
						blogRouter.navigate('admin',{trigger:true});
					},
					// If there is an error
					error: function(user, error) {
						console.log(error);
					}
				});
			},
				render: function(){
				this.$el.html(this.template());
			}
		}),
		WelcomeView = Parse.View.extend({
			template: Handlebars.compile($('#welcome-tpl').html()),
			events:{
				'click .add-blog': 'add'
			},
			add: function(){
				
				blogRouter.navigate('add', { trigger: true });
			},
			render: function(){
				var attributes = this.model.toJSON();
				this.$el.html(this.template(attributes));
				
			}
		}),
		AddBlogView = Parse.View.extend({
			template: Handlebars.compile($('#add-tpl').html()),
			events:{
			'submit .form-add':'submit'
			},
		
			submit:function(e){
				e.preventDefault();
				var data = $(e.target).serializeArray(),
				blog = new Blog();
				blog.create(data[0].value, data[1].value);
			},
			render: function(){
				this.$el.html(this.template());
			}
		}),
		EditBlogView = Parse.View.extend({
			template: Handlebars.compile($('#edit-tpl').html()),
			events: {
				'submit .form-edit': 'submit'
			},
			submit: function(e) {
				e.preventDefault();
				var data = $(e.target).serializeArray();
				this.model.update(data[0].value,$('textarea').val());
				// We will write the submit function later
			},
			render: function(){
				var attributes = this.model.toJSON();
				this.$el.html(this.template(attributes));
			}
		}),
		BlogsView =  Parse.View.extend( {
			template: Handlebars.compile($('#blogs-tpl').html()),
			render: function(){ 
				var collection = { blog: this.collection.toJSON() };
				this.$el.html(this.template(collection));
				}
		});
	
    
	
	
	var BlogRouter = Parse.Router.extend({
         
        // Here you can define some shared variables
        initialize: function(options){
            this.blogs = new Blogs();
        },
         
        // This runs when we start the router. Just leave it for now.
        start: function(){
            Parse.history.start({pushState: true});
			this.navigate('index', { trigger: true });
			},
             
        // This is where you map functions to urls.
        // Just add '{{URL pattern}}': '{{function name}}'
        routes: {
			'index':'index',
            'admin': 'admin',
            'login': 'login',
            'add': 'add',
            'edit/:id': 'edit'
        },
		
		index: function(){
			this.blogs.fetch({
				success:function(blogs){
					var blogsView = new BlogsView({ collection: blogs });
					blogsView.render();
					$('.main-container').html(blogsView.el);
				},
				error:function(blogs,error){
					console.log(error);
				}
			});
		},
         
        admin: function() {
			// This is how you can current user in Parse
			var currentUser = Parse.User.current();
		 
			if ( !currentUser ) {
				// This is how you can do url redirect in JS
				blogRouter.navigate('login', { trigger: true });
		 
			} else {
		 
				var welcomeView = new WelcomeView({ model: currentUser });
				welcomeView.render();
				$('.main-container').html(welcomeView.el);
		 
				// We change it to this.blogs so it stores the content for other Views
				// Remember to define it in BlogRouter.initialize()
				this.blogs.fetch({
					success: function(blogs) {
						var blogsAdminView = new BlogsAdminView({ collection: blogs });
						blogsAdminView.render();
						$('.main-container').append(blogsAdminView.el);
					},
					error: function(blogs, error) {
						console.log(error);
					}
				});
			}
		},
			
		login: function() {
			var loginView = new LoginView();
			loginView.render();
 			$('.main-container').html(loginView.el);
		},
			
		add: function() {
            var addBlogView = new AddBlogView();
            addBlogView.render();
            $('.main-container').html(addBlogView.el);
        },
		
		edit: function(id) {
			 
			// First, you need to define a new query and tell it which table should it go for
			var query = new Parse.Query(Blog);
			 
			// If you are looking for object by their id, 
			// just pass the id as the first parameter in .get() function
			query.get(id, {
				success: function(blog) {
					// If the blog was retrieved successfully.
					var editBlogView = new EditBlogView({ model: blog });
					editBlogView.render();
					$('.main-container').html(editBlogView.el);
				},
				error: function(blog, error) {
					// If the blog was not retrieved successfully.
				}
			});
		}
	}),
    blogRouter = new BlogRouter();
 
	blogRouter.start(); 
	
	//navigator links
	
	$(document).on('click', '.blog-nav-item', function(e) {
		e.preventDefault();
		var href = $(e.target).attr('href');
		blogRouter.navigate(href, {trigger: true });
		$(this).addClass('active').siblings().removeClass('active');
	});
});