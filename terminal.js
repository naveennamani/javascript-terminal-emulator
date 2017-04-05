var isfn=function(a) {
	return a!==undefined && typeof a==='function';
};
function terminal(id,cb,s) {
	if(!(this instanceof terminal)) return new terminal(id,cb,s);
	if(terminal.loaded!==true) terminal.load();
	this.focused=false,this.paused=false;
	var self=this;
	var dkd;
	var h={ip:[],i:undefined,t:false,d:0},ta=document.createElement("textarea"),dc=document.createElement("div"),t,ts={};
	if(id instanceof HTMLElement) t=id;
	else if((t=document.getElementById(id))==undefined) {
		t=document.createElement("div");
		t.id=id;
		document.body.appendChild(t);
	}
	ts.prompt='js>';
	if(s!==undefined) {
		var stylerules=['width','height','backgroundColor','color'];
		var terminalrules=['prompt','onfocus'];
		var styles={};
		stylerules.forEach(function(a) {
			if(s.hasOwnProperty(a)) styles[a]=s[a];
		});
		terminalrules.forEach(function(a) {
			if(s.hasOwnProperty(a)) ts[a]=s[a];
		});
		Object.assign(t.style,styles);
	}
	dc.innerHTML='<div class="col active" data-prompt="'+ts.prompt+'"><span class="blink_cursor"></span></div>';
	t.innerHTML='';
	t.classList.add("terminal");
	t.appendChild(dc);
	t.appendChild(ta);
	t.terminal=this;
	this.element=t;
	this.focus=function() {
		if(this.focused!==true) {
			if(terminal.active!==null&&terminal.active.focused==true) terminal.active.blur();
			this.focused=true;
			t.getElementsByClassName("blink_cursor")[0].classList.add("blink");	
			terminal.active=this;
			this.onfocus();
		}
		if(this.paused===false) this.start();
	};
	this.blur=function() {
		this.focused=false;
		t.getElementsByClassName("blink_cursor")[0].classList.remove("blink");
	};
	this.pause=function() {
		this.paused=true;
	};
	this.start=function() {
		//ta.value='';
		ta.focus();
		this.paused=false;
	};
	this.settext=function(cmd) {
		ta.value=cmd;
		ta.oninput();
	};
	this.echo=function(r,e) {
		dc.getElementsByClassName("active")[0].innerHTML=ta.value.replace(/^\n/,'').replace(/\n/g,'<br>');
		dc.getElementsByClassName("active")[0].classList.toggle("active");
		dc.innerHTML+='<div class="col op" style="color:'+(e?'red':'green')+'">'+r+'</div>';
		dc.innerHTML+='<div class="col active" data-prompt="'+ts.prompt+'"><span class="blink_cursor blink"></span></div>';
	};
	if(isfn(ts.onfocus))
		this.onfocus=ts.onfocus.bind(this,{});
	else
		this.onfocus=function() {
			console.log(this,'focused');
		};
	ta.oninput=function(e) {
		if(self.paused===false) {
			adjustcursor();
			t.scrollTop=t.scrollHeight-t.offsetHeight;
		}
	};
	ta.onkeypress=function(e) {
		if(self.paused===false) {
			if((e.key=='Enter'||e.which==13)&&e.shiftKey===false)
				adjustcols();
		}
	};
	ta.onkeydown=function(e) {
		if(self.paused===false) {
			if(e.key.match(/Arrow[Left,Right]/g))
				adjustcursor();
			if(e.key.match(/Arrow[Up,Down]/g))
				adjusthistory(e.key);
		}
	};
	var adjustcols=(function() {
		var ft=ta.value.replace(/^\n/,'');
		var r,e=false;
		try {
			if(isfn(cb)) r=cb(ft);
			else if(typeof cb==='object') {
				var args=ft.replace(/\n/g,' ').split(' ');
				if(cb.hasOwnProperty(args[0])) {
					if(isfn(cb[args[0]])) r=cb[args[0]].apply(this,(args.shift(),this.format(ft)));
					else r=cb[args[0]];
				} else {
					r=window.eval(ft);
				}
			} else
				r=window.eval(ft);
		} catch(err) {
			e=true;
			r=err.toString();
			console.error("Error printed here",r);
		}
		this.echo(r,e);
		if(h.t==true) {
			h.t=false;
			h.i=undefined;
			h.d=0;
		}
		h.ip.includes(ta.value)?h.ip:h.ip.push(ta.value);
		ta.value='';
	}).bind(this);
	var adjustcursor=function() {
		var ss=ta.selectionStart,se=ta.selectionEnd;
		if(ss===se) {
			dc.getElementsByClassName("active")[0].innerHTML=(ta.value.substring(0,ss)+"<span class='blink_cursor blink'>"+ta.value.charAt(se)+"</span>"+ta.value.substring(se+1,ta.value.length)).replace(/^\n/,'').replace(/\n/g,'<br>');
		}
	};
	var adjusthistory=function(k) {
		if(h.i===undefined) {
			h.i=(k=='ArrowUp')?h.ip.length-1:0;
			h.t=true;
		}
		h.d=(k=='ArrowUp')?-1:+1;
		ta.value=h.ip[h.i];
		h.i+=h.d;
		h.i=h.i<0?0:h.i>=h.ip.length?h.ip.length-1:h.i;
		ta.oninput();
	};
	this.format=terminal.format=function(a) {
		var b=[];
		var stack=function() {
			this.elements=[];
			this.push=function(e) {
				return this.elements.push(e);
			};
			this.pop=function() {
				return this.elements.pop();
			};
			this.length=function() {
				return this.elements.length;
			};
		};
		var dummy=function() {};
		var parsestring=function(a,i) {
			var s='',f=a[i++];
			do {
				s+=a[i++];
			} while(f!=a[i]&&i<a.length)
			if(a[i]!=f) console.log('Unended string');
			return [s,i+1];
		};
		var parsearray=(function(a,i) {
			console.log("array ",a,i);
			var arr=[];
			var r=new stack();
			var s='';
			do {
				s+=a[i];
				if(a[i]=='[') r.push('[');
				else if(a[i]==']') r.pop();
				if(r.length()==0) break;
			} while(++i<a.length);
			try {
				r=window.eval(s);
			} catch(e) {
				this.echo(e.toString(),true);
				r=[undefined];
			}
			/*
			do {
				console.log(a[i+1],i+1);
				if(a[++i]==']') break;
				else if(a[i]=="'" || a[i]=='"') r=parsestring(a,i);
				else if(a[i]=='[') r=parsearray(a,i);
				else if(a[i]=='{') r=parseobj(a,i);
				else if(a[i]==' '||a[i]==',') r=[new dummy(),i];
				else if(a[i]!=' ') r=parsevar(a,i);
				i=r[1];
				if(!(r[0] instanceof dummy)) arr.push(r[0]);
			} while(i<a.length-1);
			*/
			return [r,i+1];
		}).bind(this);
		var parseobj=function(a,i) {
			console.log("obj ",a,i);
			return [[],i+1];
		};
		var parsevar=function(a,i) {
			console.log("var ",a[i],i);
			var s='',r;
			while(a[i]!=' '&&a[i]!=','&&a[i]!=']'&&a!='{'&&a!='}'&&i<a.length)
				s+=a[i++];
			console.log(s);
			try {
				r=window.eval(s);
			} catch(e) {
				console.log(e);
				r=undefined;
			}
			return [r,i];
		};
		var parsenum=function(a,i) {
			console.log("num ",a,i);
			return [[],i+1];			
		};
		var parsearg=function(a) {
			//return (new Function(''
			var args=[],i=0;
			a=a.substring(a.match(/ /).index+1,a.length);
			console.log(a);
			do {
				var r;
				if(a[i]=="'" || a[i]=='"') {
					r=parsestring(a,i);
				} else if(a[i]=='[') {
					r=parsearray(a,i);
				} else if(a[i]=='{') {
					r=parseobj(a,i);
				} else if(a[i]!=' ') {
					r=parsevar(a,i);
				} else {
					r=[new dummy(),i+1];
				}
				i=r[1];
				if(!(r[0] instanceof dummy)) args.push(r[0]);
			} while(i<a.length);
			console.log(args);
			return args;
		};
		return parsearg(a);
		/*
		for(var i=0;i<a.length;i++) {
			var c=a[i];
			if(!isNaN(c)) b[i]=Number(c);
			else {
				try {
					b[i]=JSON.parse(c);
					console.log(b[i]);
				} catch(e) {
					try {
						b[i]=window.eval(c);
						console.log(b[i]);
					} catch(e) {
						b[i]=c;
						console.log(b[i]);
					}
				}
			}
		}
		*/
		return b;
	};
}
terminal.active=null;
terminal.loaded=false;
terminal.load=function() {
	var t=terminal,d=document,w=window;
	var wol=w.onload;
	var dkd=d.onkeydown;
	var dmd=d.onmousedown;
	d.onkeydown=function(e) {
		if(t.active!==null && t.active.focused==true) {
			t.active.focus();
		}
		if(isfn(dkd)) dkd(e);
	};
	d.onmousedown=function(e) {
		if(e.target.className.match(/col|datacol|terminal/g)) {
			if(t.active!==null) t.active.blur();
			e.target.closest(".terminal").terminal.focus();
		} else {
			if(t.active!==null) t.active.blur();
		}
		if(isfn(dmd)) dmd(e);
	};
	terminal.loaded=true;
};
