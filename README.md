# fotno

Framework for a CLI toolkit with a focus on user friendliness and modularity.

If you happen to have a lot of small nodejs scripts lying around and you're looking for a way to organize them, fotno
offers a solution for this. You `npm i fotno -g` once in your life and use it to mount small other modules
of your own js code. fotno exposes an easy API to deliver input options and parameters that you wanna use.

* Out of the box, fotno comes with a "--help" option that will tell users which commands, options and parameters are
  available. Try executing `fotno -h` or `fotno whichever-command -h`.
* Out of the box, fotno comes with a way to activate new modules that you can download or develop yourself.
* Uses [ask-nicely](github.com/wvbe/ask-nicely) for parsing CLI input, and [speak-softly](github.com/wvbe/speak-softly)
  to whisper something romantic back.

## Install fotno

```bash
npm i fotno -g
```

## Install a module

```bash
fotno module --add ./anywhere/my-fotno-module
```

## Create a module

This hello-world example module logs some pirate speak:

```js
module.exports = fotno => {
  fotno.registerCommand('hello', (req, res) => {
      res.caption('Hello world');
      res.log(`Ahoy ye ${req.parameters.name || 'landlubber'}!`);
    })
    .addParameter('name');
};

// fotno hello       --> "Ahoy ye landlubber!"
// fotno hello world --> "Ahoy ye world!"
```

You need two files to create your own module; `package.json` and a Javascript file that talks to an instance of
`ModuleRegistrationApi`. [Check out the example fotno module on GitHub](//github.com/wvbe/fotno-module-example).
