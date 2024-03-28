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

We'll enhance the schema and change our `User` type. This type will now contain `friends` field which will return a new type `UserConnection`. This field conforms to Relay pagination specification so I'm also adding other types that should be included:

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

input FriendSearchInput {
  name: String
}

type User {
  id: ID!
  name: String!
  email: String!
  friends(first: Int!, after: String, search: FriendSearchInput): UserConnection!
}
```

You can think of `friends` field as a list of friends the given user has, with ability to filter this list with `search` argument. Let's augment `UserCard` component `node` query with new fragment. This fragment will belong to new component `FriendList`:

```tsx
// user-card.tsx
export function UserCard() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);

  const data = useLazyLoadQuery<userCardQuery>(
    graphql`
      query userCardQuery($id: ID!, $name: String!) {
        node(id: $id) {
          __typename
          ... on User {
            __id
            ...userAvatar_User
            ...friendList_User @arguments(name: $name, first: 10) # << new field
          }
        }
      }
    `,
    {
      id: "MTpVc2VyOjEyMw==",
      name: debouncedSearch.trim().length > 0 ? debouncedSearch : "",
    }
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

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
      <label>
        Search:
        <input type="text" value={search} onChange={handleInputChange} />
      </label>
      <FriendList dataRef={data.node} />
    </>
  );
}

// friend-list.tsx
export function FriendList({ dataRef }: { dataRef: friendList_User$key }) {
  const { data, loadNext, hasNext } = usePaginationFragment(
    graphql`
      fragment friendList_User on User
      @refetchable(queryName: "friendListPaginationQuery")
      @argumentDefinitions(
        first: { type: "Int", defaultValue: 10 }
        cursor: { type: "String" }
        name: { type: "String", defaultValue: "" }
      ) {
        friends(first: $first, after: $cursor, search: { name: $name })
          @connection(key: "user_friends") {
          __id # << adding for debugging purposes
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
    dataRef,
  );

  if (!data.friends || !data.friends.edges) {
    return null;
  }

  return (
    <div>
      <pre>{data.friends.__id}</pre>
      <ul>
        {data.friends.edges.map((user) => (
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

The (first) page you will receive from server has this shape:

*Note: I'm only including partial output to include first two edges.*

```json
{
    "data": {
        "node": {
            "__typename": "User",
            "id": "MTpVc2VyOjEyMw==",
            "email": "johnny@apple.com",
            "friends": {
                "edges": [
                    {
                        "node": {
                            "id": "MTpVc2VyOmZhZDkxZjIxLTVhYzEtNDY3ZC1hOWU3LTljMmQwOTQzYjY5Zg==",
                            "name": "Lana Maggio",
                            "__typename": "User"
                        },
                        "cursor": "MTpVc2VyOmZhZDkxZjIxLTVhYzEtNDY3ZC1hOWU3LTljMmQwOTQzYjY5Zg=="
                    },
                    {
                        "node": {
                            "id": "MTpVc2VyOjU2NDY2NWRhLWViNmYtNGM3My04MDQwLTk4MjUyNzU4ZDBjYw==",
                            "name": "Gertrude Rogahn",
                            "__typename": "User"
                        },
                        "cursor": "MTpVc2VyOjU2NDY2NWRhLWViNmYtNGM3My04MDQwLTk4MjUyNzU4ZDBjYw=="
                    },

                  // 8 other edges ...
                ],
                "pageInfo": {
                    "endCursor": "MTpVc2VyOmMwYmIzYjY0LTJlZDgtNGRjNS04MTg0LWZhOGY1MjgxM2QxOA==",
                    "hasNextPage": true
                }
            }
        }
    }
}
```

There's one detail you might've missed in the code for `FriendList` component's fragment definition. I've included `__id` field to help us uncover, how the connection is identified via its Data ID. The value of this ID is:

`client:MTpVc2VyOjEyMw==:__user_friends_connection(search:{"name":""})`

Let's break down how this Data ID is created with the following diagram:

<div class="centered">
  <a href="/image/understanding_relay_data_ids-05.svg" target="_blank">
    <figure>
      <img
        src="/image/understanding_relay_data_ids-05.svg"
        loading="lazy"
        alt="Diagram of explanation of Relay's connection Data ID"
        style="width: 500px; height: auto;"
      />
      <figcaption>
        Connection Data ID
      </figcaption>
    </figure>
  </a>
</div>

Why and how is this Data ID created? It is similar to what we've already observed with `version` field. In our schema, the connection `UserConnection` does not contain any `id` field. This means that Relay has to generate the ID for us and it does it by concatenating several strings. Double colon `:` is used as separator between these strings.

We've touched on `client` string before, this is pre-determined value of Relay library so it's used as *root* prefix. Next, the Data ID of its parent type is used - in our case this equals to `id` field of `User` we've queried with `node` query.
Lastly, it uses value of `key` argument provided to `@connection` directive, in our case we defined it as `user_friends` in `friendList_User` fragment. For some reason it is prefixed with `__`. This last part also includes serialized arguments provided to the connection, in this specific case it's `search` which is empty string at the moment. I'll get to these in a moment.

Let's look at Relay dev tools to understand how it represents this connection with only first page loaded:

<div class="centered">
  <a href="/image/understanding_relay_data_ids-06.png" target="_blank">
    <figure>
      <img
        src="/image/understanding_relay_data_ids-06.png"
        loading="lazy"
        alt="Relay dev tools with UserConnection"
        style="width: 500px; height: auto;"
      />
      <figcaption>
        Wait, what?
      </figcaption>
    </figure>
  </a>
</div>

That's strange, it looks like there are two fields associated with our `User` record:

1. `__user_friends_connection(search:{"name":""})`
2. `friends(first: 10,search:{"name":""})`

What gives? Well the way I think about it is that any field starting with underscore(s), like the first one is internal field which is somehow *special*. This field `__user_friends_connection(search:{"name":""})` matches the suffix of connection's Data ID. Let's fetch another page using `loadNext` and see what happens:

<div class="centered">
  <a href="/image/understanding_relay_data_ids-07.png" target="_blank">
    <figure>
      <img
        src="/image/understanding_relay_data_ids-07.png"
        loading="lazy"
        alt="Relay dev tools with UserConnection on second page"
        style="width: 500px; height: auto;"
      />
      <figcaption>
        Next page fetched, more fields!
      </figcaption>
    </figure>
  </a>
</div>

Now we have additional `friends` field in our `User` record:

1. `__user_friends_connection(search:{"name":""})`
2. `friends(first: 10,search:{"name":""})`
3. `friends(after:"MTpVc2VyOmMwYmIzYjY0LTJlZDgtNGRjNS04MTg0LWZhOGY1MjgxM2QxOA==",first:10,search:{"name":""})`

The third field signifies another page, since `after` is a cursor to get the next page and it's one of the connection arguments, it gets serialized as well.

The `__id` field of the connection itself that we're rendering in `FriendList` component like so:

```tsx
<pre>{data.friends.__id}</pre>
```

Still renders this Data ID: `client:MTpVc2VyOjEyMw==:__user_friends_connection(search:{"name":""})`

The way I think about this is that the internal field `__user_friends_connection(search:{"name":""})` is what is actually read by hook `usePaginationFragment`. This field collects all the other pages (`UserConnection` types) so they can be represented as one long list in our UI. It can resolve those two fields on our `User` record and treat them as one list, using `after` argument to know that it needs to append it to the one list. You can see it by expanding `__user_friends_connection(search:{"name":""})` field in dev tools:

<div class="centered">
  <a href="/image/understanding_relay_data_ids-08.png" target="_blank">
    <figure>
      <img
        src="/image/understanding_relay_data_ids-08.png"
        loading="lazy"
        alt="Expanded internal field for connection"
        style="width: 500px; height: auto;"
      />
      <figcaption>
        It's all there
      </figcaption>
    </figure>
  </a>
</div>

Inspecting this field, you will see this internal field contains all 20 edges, meaning two pages since each page has 10 of them. If you would call `loadNext(5)`, it will append only 5 records to that list. So similarly to `after` argument, Relay is smart enough to recognize that we still want to represent all of this data as one list in our UI.


[^1]: The store is a data structure that contains queried, cached or payload data related to GraphQL operations performed via Relay hooks. It offers many methods to read and write to the store. You can find more  in the [official documentation](https://relay.dev/docs/api-reference/store/)([archive](https://web.archive.org/web/20240227201914/https://relay.dev/docs/api-reference/store/))

[^2]: TBD

[^3]: Updater function documentation (mention `commitLocalUpdate`)

[^4]: Link to spec regarding Global GraphQL IDs

[^4]: Link to imperative updates

[^5]: Link to connection spec
