import User from '../models/User.js';
import { signToken } from '../services/auth.js';
import { AuthenticationError } from 'apollo-server-express';

const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: { user: any }) => {
      if (!context.user) throw new AuthenticationError('You need to be logged in!');
      return User.findById(context.user._id);
    },
  },
  Mutation: {
    login: async (
      _: unknown,
      { email, password }: { email: string; password: string }
    ) => {
      const user = await User.findOne({ email });
      if (!user || !(await user.isCorrectPassword(password))) {
        throw new AuthenticationError('Invalid credentials');
      }

      const token = signToken({
        username: user.username,
        email: user.email,
        _id: user._id,
      });

      return { token, user };
    },

    addUser: async (
      _: unknown,
      { username, email, password }: { username: string; email: string; password: string }
    ) => {
      const user = await User.create({ username, email, password });

      const token = signToken({
        username: user.username,
        email: user.email,
        _id: user._id,
      });

      return { token, user };
    },

    saveBook: async (
      _: unknown,
      { input }: { input: any },
      context: { user: any }
    ) => {
      if (!context.user) throw new AuthenticationError('You must be logged in');
      return User.findByIdAndUpdate(
        context.user._id,
        { $addToSet: { savedBooks: input } },
        { new: true }
      );
    },

    removeBook: async (
      _: unknown,
      { bookId }: { bookId: string },
      context: { user: any }
    ) => {
      if (!context.user) throw new AuthenticationError('You must be logged in');
      return User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
    }
  }
};

export default resolvers;
