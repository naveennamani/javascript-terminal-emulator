# javascript-terminal-emulator
A terminal emulator plugin which converts the browser into terminal like look with ability to deal with entered commands

# Usage

## Constructor

```
term=new terminal("term");
```

This creates a new terminal on the HTMLElement having id "term", or if the id is not found it creates a new HTMLDivElement with id "term" and then adds to the body

```
term=new terminal("term",function(cmd) {
  return "You typed:"+cmd;
});
```

Pass a callback function as second parameter which will be executed with the entered command, the returned value which the function returns will be displayed on the terminal as the output of that command.

```
term=new terminal("term",{
  add:function(a,b) {
    return a+b;
  },
  sub:function(a,b) {
    return a-b;
  },
  mul:function(a,b) {
    return a*b;
  },
});
```
Provide an object with command:function pairs as the second argument to execute the user defined functions for the corresponding command entries.
The arguments to the function are derived based on the input line, and the format for the userdefined commands with arguments is as follows

`userdefined_command arg1 arg2 arg3 ...` (delimited by space or new line)
and so the userdefined_function will be called as
`userdefined_function(arg1,arg2,arg3,...)`

The terminal can be accessed inside the `userdefined_function` by using `this` keyword.

## Methods

`term.focus()` Use this function to autofocus the terminal

`term.blur()` Use this funciton to remove the focus of the terminal

`term.pause()` To pause the terminal to accept the input from the user

`term.start()` To start the terminal to accept the input from the user

## Todo

- [x] ~~User defined commands execution~~
- [ ] Support for different options to style the terminal
- [ ] JSON RPC support
- [ ] Plugins for working with Ajax & JSON
- [ ] Data streaming support from remote terminals using websockets
- [ ] support for touch devices
