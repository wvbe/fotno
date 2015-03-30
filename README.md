# fotno

fotno started out as the swiss knife for working on a specific application as an implementation partner. Today it is
more of a framework to develop new tools in. The existing fotno functionality has been moved to different modules.
You should probably install some modules before fotno starts adding value for you.

* Out of the box, fotno comes with a "help" option that will tell users which commands, options and parameters are
  available. Try executing `fotno -h` or `fotno whichever-command -h`.
* Out of the box, fotno comes with a way to activate new modules that you can download or develop yourself.

## install fotno

```bash
npm i fotno -g
```

## install a module

```bash
fotno module --add ./anywhere/my-fotno-module
```

## create a module

You need two files to create your own module; `package.json` and a Javascript file that talks to an instance of
`ModuleRegistrationApi`. [Check out the example fotno module on GitHub](//github.com/wvbe/fotno-module-example).
