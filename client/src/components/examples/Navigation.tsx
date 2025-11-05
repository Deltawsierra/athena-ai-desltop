import Navigation from '../Navigation';

export default function NavigationExample() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation onLogout={() => console.log('Logout clicked')} isAuthenticated={true} />
      <div className="p-8">
        <p className="text-muted-foreground">Navigation bar is shown above</p>
      </div>
    </div>
  );
}
