const { ApolloServer, gql } = require('apollo-server')
let { people, notes } = require('./data')

const typeDefs = gql`
  type Person {
    name: String!
    age: Int
    notes: [Note!]
  }

  type Note {
    title: String!
    description: String
    completed: Boolean!
    owner: Person!
  }

  type Query {
    getAllPeople: [Person!]
    getAllNotes: [Note!]
    getSinglePerson(name: String!): Person
    getSingleNote(title: String!): Note
  }
  
  type Mutation {
    addPerson(name: String!, age: Int): Person!
    addNote(title: String!, description: String, completed: Boolean = false, owner: String!): Note!
    deletePerson(name: String!): String!
    deleteNote(title: String!): String!
    updateAge(name: String!, age: Int!): Person!
    toggleNoteCompleted(title: String!): Note!
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
    getSinglePerson: (root, args) => people.find(p => p.name === args.name),
    getAllNotes: () => notes,
    getSingleNote: (root, args) => notes.find(n => n.title === args.title)
  },
  Mutation: {
    addPerson: (root, args) => {
      const personObject = {
        name: args.name,
        age: args.age
      }
      people.push(personObject)
      return personObject
    },
    addNote: (root, args) => {
      const noteObject = {
        title: args.title,
        description: args.description,
        completed: args.completed,
        owner: args.owner
      }
      notes.push(noteObject)
      return noteObject
    },
    deleteNote: (root, args) => {
      notes = notes.filter(n => n.title !== args.title)
      return 'Note with given title is deleted!'
    },
    deletePerson: (root, args) => {
      people = people.filter(p => p.name !== args.name)
      return 'Person with given name is deleted!'
    },
    updateAge: (root, args) => {
      const foundPerson = people.find(p => p.name === args.name)
      const updatedPerson = {
        ...foundPerson,
        age: args.age
      }
      people = people.map(p => p.name === args.name ? updatedPerson : p)
      return updatedPerson
    },
    toggleNoteCompleted: (root, args) => {
      const foundNote = notes.find(n => n.title === args.title)
      const updatedNote = {
        ...foundNote,
        completed: !foundNote.completed
      }
      notes = notes.map(n => n.title === args.title ? updatedNote : n)
      return updatedNote
    }
  }
}

const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => console.log(`Server ready at ${url}`))
