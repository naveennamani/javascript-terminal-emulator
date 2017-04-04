var isfn=function(a) {
	return a!==undefined && typeof a==='function';
};
function terminal(id,cb,s) {
	if(terminal.loaded!==true) terminal.load();
	this.focused=false,this.paused=false;
	var self=this;
	var dkd;
	var h={ip:[],i:undefined,t:false,d:0},ta=document.createElement("textarea"),dc=document.createElement("div"),t;
	if(id instanceof HTMLElement) t=id;
	else if((t=document.getElementById(id))==undefined) {
		t=document.createElement("div");
		t.id=id;
		document.body.appendChild(t);
	}
	dc.innerHTML='<div class="col active"><span class="blink_cursor"></span></div>';
	t.innerHTML='';
	t.classList.add("terminal");
	t.appendChild(dc);
	t.appendChild(ta);
	t.terminal=this;
	this.focus=function() {
		if(terminal.active!==null&&terminal.active.focused==true) terminal.active.blur();
		this.focused=true;
		t.getElementsByClassName("blink_cursor")[0].classList.add("blink");	
		if(this.paused===false) this.start();
		terminal.active=this;
	};
	this.blur=function() {
		this.focused=false;
		t.getElementsByClassName("blink_cursor")[0].classList.remove("blink");
	};
	this.pause=function() {
		this.paused=true;
	};
	this.start=function() {
		ta.value='';
		ta.focus();
		this.paused=false;
	};
	ta.oninput=function(e) {
		console.log(self.paused);
		if(self.paused===false) {
			adjustcursor();
			t.scrollTop=t.scrollHeight-t.offsetHeight;
		} else console.log('paused');
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
		dc.getElementsByClassName("active")[0].innerHTML=ft.replace(/\n/g,'<br>');
		dc.getElementsByClassName("active")[0].classList.toggle("active");
		var r,e=false;
		try {
			if(isfn(cb)) r=cb(ft);
			else if(typeof cb==='object') {
				var args=ft.replace(/\n/g,' ').split(' ');
				if(cb.hasOwnProperty(args[0])) {
					console.log(this);
					if(isfn(cb[args[0]])) r=cb[args[0]].apply(this,(args.shift(),format(args)));
					else r=cb[args[0]];
				} else {
					r='Unknown command';
				}
			} else
				r=window.eval(ft);
		} catch(err) {
			e=true;
			r=err.toString();
		}
		dc.innerHTML+='<div class="col op" style="color:'+(e?'red':'green')+'">'+r+'</div>';
		dc.innerHTML+='<div class="col active"><span class="blink_cursor blink"></span></div>';
		if(h.t==true) {
			h.t=false;
			h.i=undefined;
			h.d=0;
		}
		h.ip.includes(ta.value)?h.ip:h.ip.push(ta.value);
		ta.value='';
		//ta.oninput();
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
	var format=function(a) {
		var b=[];
		for(var i=0;i<a.length;i++) {
			var c=a[i];
			if(!isNaN(c)) b[i]=Number(c);
			else {
				try {
					b[i]=JSON.parse(c);
				} catch(e) {
					b[i]=c;
				}
			}
		}
		return b;
	};
	// Parsing the options passed to style the terminal
	if(s!==undefined) {
	}
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
