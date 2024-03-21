+++
title = "Understanding Relay Data IDs"
date = 2024-02-27T20:56:18.000Z
template = "log.html"
draft = true
[taxonomies]
tech=["relay", "graphql"]
+++

When I started using the Relay framework, I wasn't really sure what I was looking at inside the dev tools.

<div class="centered">
  <a href="/image/understanding_relay_data_ids-01.png" target="_blank">
    <figure>
      <img
        src="/image/understanding_relay_data_ids-01.png"
        loading="lazy"
        alt="Screenshot of Relay dev tools"
        style="width: 400px; height: auto;"
      />
      <figcaption>
        Relay dev tools
      </figcaption>
    </figure>
  </a>
</div>

At first glance, it all may seem quite confusing, but after spending a few years working with Relay, it has started to make a lot more sense.

Firstly, it's important to note that Relay's store[^1] employs a normalized cache. Picture the store as a key-value data structure, like a `Map`; this is what is contained within the Relay store. As a user of the library, this is mostly abstracted away from you.

The `Data ID` is used as a **key** for a given value in the normalized cache. Consider the following type being a part of your schema:

```graphql
type User {
  id: ID!
  name: String!
  email: String!
}
```

Whenever you query or receive a payload containing a type with an `id` field, that value will be used as a key for the normalized cache in the store.
Consider an example type from above. Imagine your schema includes a query like this:

```graphql
type Query {
  getUser(id: ID!): User
}
```

Perhaps your Relay code is querying this data somewhere, and you are obtaining some fields using a fragment.

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
      __typename
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
      "__typename": "User",
      "id": "MTpVc2VyOjEyMw==",
      "name": "Johnny Appleseed"
    }
  }
}
```

{% callout(title="__typename field") %}
  The field is part of the `userPanelHeading_User` fragment but it is not required, Relay store infers `__typename` automatically if your `ID` conforms to specification of encoded Global GraphQLIDs[^4].
{% end %}

Upon receiving data, Relay recognizes the `getUser` field to return the `User` type. It then uses the key `id` with corresponding value of `MTpVc2VyOjEyMw==` and registers this in the store. Relay dev tools will display a key labeled `getUser(id: "MTpVc2VyOjEyMw==")`.
This record, however, contains a `__ref` attribute that redirects to a separate stored record holding the `MTpVc2VyOjEyMw==` ID:

<div class="centered">
  <a href="/image/understanding_relay_data_ids-02.png" target="_blank">
    <figure>
      <img
        src="/image/understanding_relay_data_ids-02.png"
        loading="lazy"
        alt="Screenshot of a field named getUser inside Relay dev tools"
        style="width: 400px; height: auto;"
      />
      <figcaption>
        Name of the query and its arguments used as a key
      </figcaption>
    </figure>
  </a>
</div>

While the implications of this may seem negligible, its significance becomes apparent within a data-intensive application. Relay's approach emphasizes minimizing _waterfall_ requests. This is evident in its adoption of data fragments, which are linked to React components. These fragments define data dependencies, however the actual data fetching can be triggered elsewhere within your component tree, optimally at the top, at the root level.

Let's' adjust our schema so the `User` implements the Node interface[^3]. The Query now defines the `node` field:

```graphql
interface Node {
  id: ID!
}

type User implements Node {
  id: ID!
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
      __typename
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

Now the real fun part begins. Instead of storing this data under a new key, Relay recognizes that you've requested the same user data, but this time with additional fields. It retains the existing data but enhances it with the `email` field. Brilliant!

You can verify this by revisiting the Relay dev tools. You will now see a new key next to the existing `getUser` key, holding the value: `node(id: "MTpVc2VyOjEyMw==")`. However, it also has a *reference* (note the `__ref` property), which leads back to the same `User` record which now also includes the requested `email` field:

<div class="centered">
  <a href="/image/understanding_relay_data_ids-03.png" target="_blank">
    <figure>
      <img
        src="/image/understanding_relay_data_ids-03.png"
        loading="lazy"
        alt="Screenshot of a Relay dev tools displaying node and getUser fields"
        style="width: 400px; height: auto;"
      />
      <figcaption>
        Both `node` and `getUser` reference the same `User` object
      </figcaption>
    </figure>
  </a>
</div>

This significantly saves space in large applications, with the benefits becoming even more apparent when managing connections.

It's worth mentioning that it's quite common for some queries not to return a type with `id`. Let's introduce `Version` type, which characterizes a version of our application. This type doesn't include `id`, so it's unreachable via the `node` query.

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
          __typename
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
      "__typename": "Version",
      "value": "1.0.0"
    }
  }
}
```

Inspecting the store via dev tools reveals that store now holds this data under key `version`, it points to this data via `__ref` property which has value `client:root:version`. How come?

<div class="centered">
  <a href="/image/understanding_relay_data_ids-04.png" target="_blank">
    <figure>
      <img
        src="/image/understanding_relay_data_ids-04.png"
        loading="lazy"
        alt="Screenshot of a Relay dev tools displaying version field"
        style="width: 400px; height: auto;"
      />
      <figcaption>
        Notice anything strange?
      </figcaption>
    </figure>
  </a>
</div>

Since this query and its returned type do not contain an `id` field, Relay requires a unique *key* to store it in its normalized cache. Typically, this would be the value of the `id`. However, in this absence, the library generates its own unique key instead.

It's using `client:root` as its prefix. This prefix is pre-defined in the library, then it appends name of the query `version` which results in `client:root:version`.

Every piece of data can be referenced in the cache by a key. This key is known as **Data ID**. **For types that contain an `id` field, they resolve to its value. For types that lack an `id` field, Relay generates one for you**. This applies to our `Version` type as returned by our `version` query.

Relay can expose this Data ID value in queries using a special field `__id`. I call it special because this field, although not part of the schema, is added by Relay to every type for ease of use. This allows us to broaden our `node` query to retrieve the Data ID for the `User` type. In this case, the `id` value is what you will receive.

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

This code renders `client:root:version` in a `<pre>` tag, which is located right above the `1.0.0` string (which is our value for the `value` field).

The usefulness of `__id` becomes increasingly apparent when your application performs advanced data manipulation within the Relay store. These manipulations often take place inside *updater* functions[^4], with an imperative approach[^5].

It's typically straightforward to pass the `id` field to a mutation, but the `__id` field becomes far more crucial when dealing with connections[^6]. Let's briefly deviate here and illustrate how Data IDs are represented in connections.

We'll enhance our schema with a `users` query that returns a connection containing `User` types, which we've previously defined in earlier steps:

*Note: I'm omitting some types we declared in previous steps for brevity.*

```graphql
# ...
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  endCursor: String
  startCursor: String
}

type UserEdge {
  cursor: String!
  node: User
}

type UserConnection {
  edges: [UserEdge]
  pageInfo: PageInfo!
}

type Query {
  # ...
  users(first: Int, after: String): UserConnection!
}
```

We will have two components fetching for `users` field:

```tsx
// user-list-container.tsx
export function UserListContainer() {
  const data = useLazyLoadQuery<userListContainerQuery>(
    graphql`
      query userListContainerQuery {
        ...userList_User
      }
    `,
    {}
  );

  return (
    <UserList dataRef={data} />
  );
}

// user-list.tsx
export function UserList({ dataRef }: { dataRef: userList_User$key }) {
  const { data, loadNext, hasNext } = usePaginationFragment(
    graphql`
      fragment userList_User on Query
      @refetchable(queryName: "userListPaginationQuery")
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 10 }
        cursor: { type: "String" }
      ) {
        users(first: $count, after: $cursor)
          @connection(key: "userList__users") {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
    dataRef
  );

  if (!data.users || !data.users.edges) {
    return null;
  }

  return (
    <div>
      <ul>
        {data.users.edges.map((user) => (
          <li key={user?.node?.id}>{user?.node?.name}</li>
        ))}
      </ul>
      <button onClick={() => loadNext(10)} disabled={!hasNext}>
        Next
      </button>
    </div>
  );
}
```

[^1]: The store is a data structure that contains queried, cached or payload data related to GraphQL operations performed via Relay hooks. It offers many methods to read and write to the store. You can find more  in the [official documentation](https://relay.dev/docs/api-reference/store/)([archive](https://web.archive.org/web/20240227201914/https://relay.dev/docs/api-reference/store/))

[^2]: TBD

[^3]: Updater function documentation (mention `commitLocalUpdate`)

[^4]: Link to spec regarding Global GraphQL IDs

[^4]: Link to imperative updates

[^5]: Link to connection spec
