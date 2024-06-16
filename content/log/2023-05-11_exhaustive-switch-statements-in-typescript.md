+++
title = "Exhaustive switch statements in Typescript"
date = 2023-05-11T21:00:00.000Z
description = "Tips for implementing exhaustive switch statements in Typescript"
template = "log.html"
[taxonomies]
tech=["typescript"]
[extra]
image = "image/og/exhaustive-switch-statements-in-typescript.webp"
+++

I was looking for a way to exhaustively type-check `switch` statements when writing Typescript. I went through few iterations with a colleague at work before we arrived at something that worked.

The goal is to always cover all possible cases using `case`, similarly how language such as Rust forces you to return value as `Option<...>`.

_Note: All code examples were tested on Typescript v5.1.6_

Imagine the following example code:

```typescript
    type Id = "A" | "B" | "C";

    function getId(id: Id) {
      switch (id) {
        case "A":
          return "first";
        case "B":
          return "second";
        default:
          return "third";
      }
    }
```

Now we want to make sure that Typescript compiler throws an error because case for value "C" is not covered.

Simple solution would be to omit `default` value like this:

```typescript
    function getId(id: Id): 'first' | 'second' {
      switch (id) {
        case "A":
          return "first";
        case "B":
          return "second";
      }
    }
```

Sure it does work, but this solution assumes that:

- The `switch` statement is always inside a function that returns primitive types - so you also need to make sure that you type the return values explicitly.
- You must explicitly omit `default` case for this to work. More often than not, the codebase you're working on might have lint rule such as `default-case` enabled and will force you to add the default case - which is good! But then you're unable to use this pattern.

Maybe you might have seen built-in type `never` and you wondered what it's good for? Well, it can be useful for making sure you can fail something, we can leverage this type to make sure default case never happens.

```typescript
type Id = "A" | "B" | "C";

function noop(_: never) {
  return;
}

function getId(id: Id) {
  switch (id) {
    case "A":
      return "first";
    case "B":
      return "second";
    default:
      return noop(id);
  }
}

getId("B");
```

Now you're getting this type-checking error:

```shell
Argument of type 'string' is not assignable to parameter of type 'never'
```

The "trick" here is simple: function `noop` cannot ever receive any argument. And since there is missing case for "C", Typescript compiler correctly assumes that there's a real possibility of an argument being passed to the function. 

✅ When you correct this mistake, the error goes away:

```typescript
type Id = "A" | "B" | "C";

function noop(_: never) {
  return;
}

function getId(id: Id) {
  switch (id) {
    case "A":
      return "first";
    case "B":
      return "second";
    case "C":
      return "third";
    default:
      return noop(id);
  }
}

getId("B");
```

The secret sauce is defining `noop`, I've also seen this function being called `absurd`.

I already mentioned React and how this can be leveraged when returning `JSX` from the component. I give you the following example in which I have `OkComponent` and `ErrorComponent` which render child components depending on their `type` prop:

```tsx
import React from "react";

type Data =
  | { type: "LOG"; name: string }
  | { type: "WARN"; name: string }
  | { type: "ERROR"; name: string };

function absurd<A>(_: never): A {
  throw new Error("Called `absurd` function which should be uncallable");
}

function Log({ name }: { name: string }) {
  return <span>Logged {name}</span>;
}

function Warn({ name }: { name: string }) {
  return <span style={{ color: "yellow" }}>Warning {name}</span>;
}

function Err({ name }: { name: string }) {
  return <span style={{ color: "red" }}>Error {name}</span>;
}

// ✅ This component will run OK and compiles without any error
const OkComponent = (props: Data) => {
  switch (props.type) {
    case "LOG":
      return <Log name={props.name} />;
    case "WARN":
      return <Warn name={props.name} />;
    case "ERROR":
      return <Err name={props.name} />;
    default:
      return absurd(props);
  }
};

// ❌ This component will fail and compile with an error
const ErrorComponent = (props: Data) => {
  switch (props.type) {
    case "LOG":
      return <Log name={props.name} />;
    case "WARN":
      return <Warn name={props.name} />;
    default:
      return absurd(props);
  }
};
```

This example shows you how the exhaustive `switch` statement can be made to work with non-primitive types such as JavaScript object.

On top of this, the `absurd` function also throws. This means not only you get error from Typescript compiler, but you also get one from the JavaScript run-time, however this might be something you might _not_ want to do. It depends on your use case, perhaps you'd like to log the error to your logging service instead.

_Tip: when using `absurd` with `throw` in React, it will trigger error boundary._

This pattern might not fit everyone. It requires developers to always add `absurd` function to their default case. Abstracting it away is possible, but I think it makes the code more opaque. It might look out of place in some code bases, the concept feels more aligned with functional style of programming.

But for those who like to have their execution paths well covered I would say it's a good approach. This pattern could be supported by linter where each `switch` would require calling `absurd` in the default case.
