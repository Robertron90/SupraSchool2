import {
  ApolloClient,
  createHttpLink,
  gql,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'https://supraschool.online/api',
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = process.browser && localStorage.getItem('__jwt');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `${token}` : '',
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export const sdkKey = 'tLEQsegzliouexzcUscMPC48ltAXnisKKuQu';

export const GET_USER = gql`
  query {
    me {
      id
      firstName
      secondName
      email
      isConfirmed
      phoneNumber
      password
      courses {
        owner {
          firstName
          secondName
        }
        name
        id
      }
    }
  }
`;

export const JOIN_ZOOM = gql`
  mutation joinZoom($courseId: Int!) {
    joinZoom(input: { courseId: $courseId }) {
      topic
      signature
      password
    }
  }
`;

export const JOIN_JITSI = gql`
  mutation joinJitsi($courseId: Int!) {
    joinJitsi(input: { courseId: $courseId }) {
      roomName
      signature
    }
  }
`;

export const GET_LECTURE = gql`
  query getLecture($id: String!) {
    introductionLecture(id: $id) {
      name
    }
  }
`;

export const JOIN_LECTURE = gql`
  mutation joinIntroductionLecture($id: String!, $displayName: String) {
    joinIntroductionLecture(input: { id: $id, displayName: $displayName }) {
      roomName
      signature
    }
  }
`;

export const LOGIN = gql`
  mutation login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      id
      firstName
      token
      isConfirmed
    }
  }
`;

export const REGISTER = gql`
  mutation register(
    $firstName: String!
    $secondName: String!
    $email: String!
    $phoneNumber: String!
    $password: String!
  ) {
    register(
      input: {
        firstName: $firstName
        secondName: $secondName
        email: $email
        phoneNumber: $phoneNumber
        password: $password
      }
    ) {
      id
      email
    }
  }
`;

export const CONFIRM = gql`
  mutation confirm($id: Int!, $token: String!) {
    confirm(input: { id: $id, token: $token }) {
      id
      email
    }
  }
`;
