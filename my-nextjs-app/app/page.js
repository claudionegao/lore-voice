import NameForm from './components/NameForm/NameForm';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold mb-4">Welcome to Our App!</h1>
        <p className="text-lg mb-6">Please enter your name to connect:</p>
        <NameForm />
    </main>
  );
}