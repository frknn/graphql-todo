const { ApolloServer, gql } = require('apollo-server')
let { people, notes } = require('./data')

const typeDefs = gql`
  type Person {
    id: ID
    name: String!
    age: Int
    notes: [Note!]
  }

  type Note {
    id: ID
    title: String!
    description: String
    completed: Boolean!
    owner: Person
  }

  type Query {
    getAllPeople: [Person!]
    getAllNotes: [Note!]
    getSinglePerson(id: ID!): Person
    getSingleNote(title: String!): Note
  }

  type Mutation {
    addPerson(name: String!, age: Int): Person
    addNote(title: String!, description: String, completed: Boolean = false, owner: String!): Note!
    deletePerson(id: ID!): Person!
    deleteNote(id: ID!): Note!
    updateAge(id: ID!, age: Int!): Person!
    toggleNoteCompleted(id: ID!): Note!
  }
`

const resolvers = {
  Person: {
    notes: (root) => notes.filter(n => n.owner === root.name)
  },
  Note: {
    owner: (root) => people.find(p => p.name === root.owner)
  },
  Query: {
    getAllPeople: () => people,
    getSinglePerson: (root, args) => people.find(p => p.id == args.id),
    getAllNotes: () => notes,
    getSingleNote: (root, args) => notes.find(n => n.title === args.title)
  },
  Mutation: {
    addPerson: (root, args) => {
      const personObject = {
        id: Math.floor(Math.random() * 100) + 3,
        name: args.name,
        age: args.age
      }
      people.push(personObject)
      return personObject
    },
    addNote: (root, args) => {
      const noteObject = {
        id: Math.floor(Math.random() * 100) + 7,
        title: args.title,
        description: args.description,
        completed: args.completed,
        owner: args.owner
      }
      notes.push(noteObject)
      return noteObject
    },
    deletePerson: (root, args) => {
      const personToDelete = people.find(p => p.id == args.id)
      people = people.filter(p => p.id != args.id)
      return personToDelete
    },
    deleteNote: (root, args) => {
      const noteToDelete = notes.find(n => n.id == args.id)
      notes = notes.filter(n => n.id != args.id)
      return noteToDelete
    },
    updateAge: (root, args) => {
      const foundPerson = people.find(p => p.id == args.id)
      const updatedPerson = {
        ...foundPerson,
        age: args.age
      }
      people = people.map(p => p.id == args.id ? updatedPerson : p)
      return updatedPerson
    },
    toggleNoteCompleted: (root, args) => {
      const foundNote = notes.find(n => n.id == args.id)
      const updatedNote = {
        ...foundNote,
        completed: !foundNote.completed
      }
      notes = notes.map(n => n.id == args.id ? updatedNote : n)
      return updatedNote
    }
  }
}

const server = new ApolloServer({ typeDefs, resolvers })
server.listen(
  {
    port: process.env.PORT || 4000
  }
).then(({ url }) => console.log(`Server ready at ${url}`))