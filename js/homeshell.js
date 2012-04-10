var HomeShell;
(function($){
	HomeShell = function(node, config){
		this.history = [];
		this.historyPosition = 0;
		this.node = node;
		this.config = config;
		this.host = config.hostname;
		this.PS1 = this.host+':~ $ ';
		this.commands = {
			help: function(homeshell, args){
				homeshell.output("COMMANDS:");
				$.each(homeshell.commands, function(name){
					homeshell.output("\t"+name);
				});
			},
			clear: function(homeshell, args){
				$(homeshell.node).empty();
			}
		}
		this.init();
	}
	
	HomeShell.find = function(node){
		if($(node).hasClass("homeshell"))
			return $(node).data("homeshell");
		else
			return $(node).parents(".homeshell").data("homeshell");	
	}
	
	HomeShell.prototype.addCommand = function(command, callback){
		this.commands[command] = callback;
	}
	
	HomeShell.prototype.init = function(){
		$(".homeshell, .homeshell *").live("click", function(event){
			var homeshell = HomeShell.find(this);
			$(homeshell.node).find(".homeshell-input:last input").focus();
		});
		
		this.output("If you're confused, try asking for help.");
		this.prompt();
	}
	
	HomeShell.prototype.prompt = function(){
		$(this.node).append('<div class="homeshell-line">'+this.PS1+'<form class="homeshell-input"><input type="text" /></form></div>');
		$(this.node).find(".homeshell-input:last").bind("submit", this.handleInput);
		$(this.node).find(".homeshell-input:last input").css({
			backgroundColor: this.config.background,
			color: this.config.foreground,
			fontFamily: this.config.fontFamily,
			fontSize: this.config.fontSize,
			border: "0px solid"
		}).focus();
	}
	
	HomeShell.prototype.handleInput = function(event){
		var homeshell = HomeShell.find(this);
		var input = $(this).children(":first");
		
		homeshell.history.push(input.val());
		homeshell.historyPosition = homeshell.history.length - 1;
		
		homeshell.run(input.val());
		homeshell.prompt();
		
		$(input).replaceWith("<span>"+input.val()+"</span>");
		
		return false;
	}
	
	HomeShell.prototype.handleKey = function(event){
		var homeshell = HomeShell.find(this);
		switch(event.which){
		
		case 38:
			//homeshell.historyBack();
			return false;
		case 40:
			//homeshell.historyForward();
			return false;
			
		}
	}
	
	HomeShell.prototype.historyBack = function(){
		if(this.historyPosition > -1){
			$(this.node).find(".homeshell-input:last input").val(this.history[this.historyPosition]);
			this.historyPosition -= 1;
		}
	}
	
	HomeShell.prototype.historyForward = function(){
		if(this.historyPosition < this.history.length){
			$(this.node).find(".homeshell-input:last input").val(this.history[this.historyPosition]);
			this.historyPosition += 1;
		}
	}
	
	HomeShell.prototype.run = function(input){
		var args = input.split(/\s+/);
		var command = args.shift();
		if(command=="") return;
		if(typeof this.commands[command] == "function"){
			(this.commands[command])(this, args);
		}else{
			this.output("ERROR: Command not found: "+command);
		}
	}
	
	HomeShell.prototype.output = function(output){
		$(this.node).append('<div class="homeshell-line"><pre>'+output+'</pre></div>');
	}
	
	$.fn.extend({
		
		homeshell: function(options){
			var homeshell = HomeShell.find(this);
			if(typeof homeshell != "undefined")
				return homeshell;
			
			var config = {
				width: 800,
				height: 600,
				background: "#000",
				foreground: "#fff",
				fontFamily: "monospace",
				fontSize: "14px",
				hostname: window.location.hostname
			};
			
			if(options) $.extend(config, options);
			
			$(this).data("homeshell", new HomeShell(this, config));
			
			return this.each(function(){
				$(this).addClass("homeshell");
				$(this).width(config.width);
				$(this).height(config.height);
				$(this).css({
					backgroundColor: config.background,
					color: config.foreground,
					fontFamily: config.fontFamily,
					fontSize: config.fontSize
				});
			});
		}
		
	});
})(jQuery);