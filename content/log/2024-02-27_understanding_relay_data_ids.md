+++
title = "Understanding Relay Data IDs"
date = 2024-02-27T20:56:18.000Z
template = "log.html"
draft = true
[taxonomies]
tech=["relay", "graphql"]
+++

Starting out with Relay framework, I wasn't really sure whenever I was looking inside dev tools:

It all looks really confusing at first sight but after some years working with Relay bunch of that now makes more sense.

First of all, it's important to mention that Relay's store[^1] uses normalized cache. Imagine the store being key-value data structure, such as `Map`, that is what's contained within the Relay store and for you as a consumer of the library, mostly abstracted away from you.

`Data ID` is what's used as a **key** for given value in the normalized cache. Consider following type being part of your schema:

```graphql
type User {
  id: ID!
  name: String!
  email: String!
}
```

Whenever you query or receive payload which contains a type with `id` field, it will use that value as a key for the normalized cache in the store.

Taking from our example type from above, imagine your schema contains query like this:

```graphql
type Query {
  getUser(id: ID!): User
}
```

Perhaps your Relay code is querying this data somewhere and you are obtaining some fields using a fragment:

```tsx
// user-panel.tsx
export function UserPanel() {
    const data = useLazyLoadQuery<userPanelQuery>(
        graphql`
          query userPanelQuery($id: ID!) {
            getUser(id: $id) {
              ...userPanelHeading_User
            }
          }
        `,
        {
          id: "MTpVc2VyOjEyMw==",
        }
    );

    return <UserPanelHeading dataRef={data.getUser} />;
}

// user-panel-heading.tsx
export function UserPanelHeading({ dataRef }: { dataRef: userPanelHeading_User$key }) {
  const { id, name } = useFragment(graphql`
    fragment userPanelHeading_User on User {
      id
      name
    }
  `, dataRef)

  return <p key={id}><strong>Name: </strong>{name}</p>
}
```

And the response might look something like this:

```json
{
  "data": {
    "getUser": {
      "id": "MTpVc2VyOjEyMw==",
      "name": "Johnny Appleseed"
    }
  }
}
```

When that data is received, Relay knows that `getUser` field returns `User` type. It automatically uses key `id` with value `MTpVc2VyOjEyMw==` to write it to the store.

If you open Relay dev tools, you will see that there's a key like this `getUser(id: "MTpVc2VyOjEyMw==")`. But this record has `__ref` property which points to separate store record which has that `MTpVc2VyOjEyMw==` ID.

Now you might not think this is a big deal but if you have data-heavy application, you will come to appreciate the following.

The _Relay-way_ is to minimize "waterfall" requests and the library is very opinionated about this - that is why it has concepts of data fragments tied to components. The fragments define data dependencies but the actual fetching can happen in a completely different place of your component tree, ideally all the way at the top on the root level.

We augment our schema so `User` type conforms to Node interface[^3]. The query now also contains `node` field:

```graphql
interface Node {
  id: ID!
}

type User implements Node {
  name: String!
  email: String!
}

type Query {
  getUser(id: ID!): User
  node(id: ID!): User
}
```

Consider the following scenario: you have a different UI, let's say a `Card` component which only needs user's email to render a gravatar. We'll use different fragment:

```tsx
// user-card.tsx
export function UserCard() {
  const data = useLazyLoadQuery<userCardQuery>(
    graphql`
      query userCardQuery($id: ID!) {
        node(id: $id) {
          __typename
          ... on User {
            ...userAvatar_User
          }
        }
      }
    `,
    {
      id: "MTpVc2VyOjEyMw==",
    }
  );

  if (!data.node) {
    return null;
  }

  if (data.node.__typename !== "User") {
    return null;
  }

  return <UserAvatar dataRef={data.node} />;
}

// user-avatar.tsx
export function UserAvatar({ dataRef }: { dataRef: userAvatar_User$key }) {
  const { email } = useFragment(graphql`
    fragment userAvatar_User on User {
      id
      email
    }
  `, dataRef);

  return <Gravatar email={email} />;
}
```

Calling the `node` query, we receive the following payload:

```json
{
  "data": {
    "node": {
      "__typename": "User",
      "id": "MTpVc2VyOjEyMw==",
      "email": "johnny@apple.com"
    }
  }
}
```

Now the real fun part begins: instead of placing this data into the store under some new key, Relay knows that you've asked for the same user but this time with additional data. It leaves the existing data in place but augments it with `email` field. Brilliant!

You can confirm this by looking again into Relay dev tools. You will now see new key next to existing `getUser` key, this time it has this value: `node(id: "MTpVc2VyOjEyMw==")` but again, it has *reference* (notice `__ref` property) which points to the same record of type `User`.

This significantly saves on space in very big applications and this upside becomes even more pronounced when dealing with connections.

[^1]: The store is a data structure that contains queried, cached or payload data related to GraphQL operations performed via Relay hooks. It offers many methods to read and write to the store. You can find more  in the [official documentation](https://relay.dev/docs/api-reference/store/)([archive](https://web.archive.org/web/20240227201914/https://relay.dev/docs/api-reference/store/))
[^2]: TBD
