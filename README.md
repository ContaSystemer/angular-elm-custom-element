Hello everyone. Hope you're all doing great. We at [Conta Systemer AS](https://contasystemer.no/) have chosen a path to migrate our existing code base from AngularJS to Elm. It's obvious that AngularJS is dying. It's nice that we have a great oportinity to use such language as Elm.

We have quite big application written in AngularJS (more than 100k LoC). And It would be quite stupid and very time consuming to rewrite everything on Elm. So we thought hard how to achieve best collaboration between AngularJS and Elm. Which will give us possibility to reuse code both ways.

The part when we want to add new functionality written on Elm to AngularJS app is straight forward. And it works really well.
* Create new directive/component
* Embed Elm program
* Use ports for communication

But we also want to reuse heavy directives/components written on AngularJS in Elm. The best way to do it would be to wrap AngularJS componen/directive with custom element. So we can use `Html.node "custom-element-name" ...` to let browser render it and compile AngularJS component/directive. Custom elements are really great. They allow us to create AngularJS scope on the fly and compile directive/component with all required stuff for it.

This gist will show you how to automate wrapping of AngularJS component/directive with custom element. It works well for us so far.

At [Conta Systemer AS](https://contasystemer.no/) we use ES5 syntax for custom elements so that we don't have to transpile ES6 syntax. You can find more information about it in [this gist](https://gist.github.com/akoppela/8a19d9b039e9af21c4b27b5c4c998782).

You can see the usage example [here](https://ellie-app.com/3DpGN7FG2kra1)