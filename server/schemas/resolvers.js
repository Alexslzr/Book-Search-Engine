const { User }  = require('../models')
const { AuthenticationError} = require('apollo-server-express')
const { signToken } = require('../utils/auth')

const resolvers = {
    Query: {
        me: async (parents, {username})=> {
            return await User.findOne({username}).populate('savedBooks')
        }
    },
    Mutation: {
        
        addUser: async (parent, {username, email, password})=> {
            const user = await User.create({username, email, password})
            const token = signToken(user);
            return {user, token}
        },
        login: async (parent, {email, password})=> {
            const user = await User.findOne({email})

            if(!user){
                throw new AuthenticationError('No user found with this email address')
            }

            const correctPw = await user.isCorrectPassword(password)

            if(!correctPw){
                throw new AuthenticationError('Incorrect Credentials')
            }
            const token = signToken(user)

            return {token, user}
        },

        saveBook: async (parent, args,context)=> {
            const book= Book.create({args})

            const user = User.findOneAndUpdate(
                {_id: context._id},
                { $addToSet: { savedBooks: book._id } },
                { new: true, runValidators: true });

            return user          
        },

        removeBook: async (parent , {bookID})=> {
            return await Book.findOneAndDelete({
                bookId : bookID
            })
        }

    }
}

module.exports = resolvers