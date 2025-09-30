import NameForm from './components/NameForm';
import { UserProvider } from './context/UserContext';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <UserProvider>
        <h1 className="text-4xl font-bold mb-4">Welcome to Our App!</h1>
        <p className="text-lg mb-6">Please enter your name to connect:</p>
        <NameForm />
      </UserProvider>
    </main>
  );
}