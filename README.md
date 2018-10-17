# How to wrap AngularJS component/directive so that it can be used inside Elm program.

Hello everyone. Hope you're all doing great.
We at [Conta Systemer AS] have chosen a path to migrate our existing code base from AngularJS to Elm.
It's obvious that AngularJS is dying. It's nice that we have a great opportunity to use such language as Elm.

We have a quite big application written in AngularJS (more than 100k LoC).
And It would be quite stupid and very time consuming to rewrite everything on Elm.
So we thought hard how to achieve the best collaboration between AngularJS and Elm.
Which will give us the possibility to reuse code both ways.

The part when we want to add new functionality written on Elm to AngularJS app is straightforward. And it works really well.
* Create a new directive/component
* Embed Elm program
* Use ports for communication

But we also want to reuse heavy directives/components written on AngularJS in Elm.
The best way to do it would be to wrap AngularJS component/directive with a custom element.
So we can use `Html.node "custom-element-name" ...` to let browser render it and compile AngularJS component/directive.
Custom elements are really great.
They allow us to create AngularJS scope on the fly and compile directive/component with all required stuff for it.

In this repo you can find an AngularJS service which will automate wrapping of a component/directive with a custom element.
It works well for us so far.

At [Conta Systemer AS] we use ES5 syntax for custom elements so that we don't have to transpile ES6 syntax.
You can find more information about it in [this gist][custom-elements-gist].

You can see the usage example [here][example].

[Conta Systemer AS]: https://github.com/ContaSystemer
[custom-elements-gist]: https://gist.github.com/akoppela/8a19d9b039e9af21c4b27b5c4c998782
[example]: https://ellie-app.com/3Dr29ZgH6KHa1

---

![Conta Systemer AS](https://contasystemer.no/wp-content/themes/contasystemer/images/logo.png)