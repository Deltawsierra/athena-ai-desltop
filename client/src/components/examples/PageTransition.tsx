import PageTransition from '../PageTransition';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function PageTransitionExample() {
  const [page, setPage] = useState('page1');
  
  return (
    <div className="p-8 space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => setPage('page1')}>Page 1</Button>
        <Button onClick={() => setPage('page2')}>Page 2</Button>
      </div>
      
      <PageTransition location={page}>
        <div className="p-8 bg-card rounded-lg">
          <h1 className="text-2xl font-bold">
            {page === 'page1' ? 'Welcome to Page 1' : 'Welcome to Page 2'}
          </h1>
        </div>
      </PageTransition>
    </div>
  );
}
