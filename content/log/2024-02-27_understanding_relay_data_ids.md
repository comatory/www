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

It is quite common that some queries might not return type with `id`. Let's add type `Version` which describes a version of our application. This type does not include `id` so it's not reachable via `node` query:

```graphql
type Version {
  value: String!
}

type Query {
  getUser(id: ID!): User
  node(id: ID!): User
  version: Version
}
```

We will query for that field via React component:

```tsx
// version.tsx
export function Version() {
  const data = useLazyLoadQuery<versionQuery>(
    graphql`
      query versionQuery {
        version {
          value
        }
      }
    `,
    {}
  );

  return <pre>{data.version?.value}</pre>
}
```

Upon calling `version` query, the returned payload from server has this shape:

```json
{
  "data": {
    "version": {
      "value": "1.0.0"
    }
  }
}
```

Inspecting the store via devtools, you'll notice store now holds this data under key `version`, it points to the data via `__ref` with value `client:root:version`. How come?

Since this query and its returned type do not contain `id`, Relay needs some *key* to store it in its normalized cache. Usually this is value of `id` but in this case, the library generates its own key instead.
It's using `client:root` as its prefix. This prefix is pre-defined in the library, then it appends name of the query `version` which results in `client:root:version`.

Every piece of data can be referenced in the cache by this key. This key is called **Data ID**. **For types that contain `id` field, they resolve to its value. For types that do not have `id` field, Relay generates one for you**. Such is the case of our `Version` type returned by our `version` query.

Relay can expose this Data ID value as a special field `__id` in queries. I call it special because this field is not part of your schema but is added by Relay to every type for convenience.

This means we can expand our `node` query to retrieve Data ID for `User` type. In this scenario, you'll just get value of `id`:

```tsx
// user-card.tsx
export function UserCard() {
  const data = useLazyLoadQuery<userCardQuery>(
    graphql`
      query userCardQuery($id: ID!) {
        node(id: $id) {
          __typename
          ... on User {
            __id # << we added special Data ID field
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

  return (
    <>
      <pre>{data.node.__id}</pre>
      <UserAvatar dataRef={data.node} />
    </>
  );
}
```

This will render `MTpVc2VyOjEyMw==` value inside `<pre>` tag. Does not look very useful at first sight but let's show an example with `version` query for completeness sake:

```tsx
// version.tsx
export function Version() {
  const data = useLazyLoadQuery<versionQuery>(
    graphql`
      query versionQuery {
        version {
          __id # << Data ID field
          value
        }
      }
    `,
    {}
  );

  return (
    <>
      <pre>{data.version?.__id}</pre>
      <pre>{data.version?.value}</pre>
    </>
  );
}
```

This renders `client:root:version` in `<pre>` tag, just right above `1.0.0` string (our value for `value` field).

The usefulness of `__id` becomes more apparent when your application does advanced data manipulation within Relay store. These manipulations usually take place inside *updater* functions[^3], performing some kind of imperative data updates[^4].

It's usually easy enough to pass `id` field to a mutation, but `__id` field becomes way more important when dealing with connections[^5]. Let's take a small detour here and show how Data IDs are represented for connections.

We'll expand our schema with query `users` which will return connection containing `User` types which we've already declared in previous steps.

[^1]: The store is a data structure that contains queried, cached or payload data related to GraphQL operations performed via Relay hooks. It offers many methods to read and write to the store. You can find more  in the [official documentation](https://relay.dev/docs/api-reference/store/)([archive](https://web.archive.org/web/20240227201914/https://relay.dev/docs/api-reference/store/))
[^2]: TBD
[^3]: Updater function documentation (mention `commitLocalUpdate`)
[^4]: Link to imperative updates
[^5]: Link to connection spec
