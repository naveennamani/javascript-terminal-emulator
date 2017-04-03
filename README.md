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

## Methods

`term.focus()` Use this function to autofocus the terminal

`term.blur()` Use this funciton to remove the focus of the terminal

## Todo

- [ ] User defined commands execution
- [ ] JSON RPC support
- [ ] Plugins for working with Ajax & JSON
- [ ] Data streaming support from remote terminals using websockets
