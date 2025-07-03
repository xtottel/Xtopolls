//import { Container } from "@/components/layouts/Container";
export default function Loading() {
  return (
   
      <div className="container mx-auto px-4 py-8">
         {/* <Container> */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-64"></div>
            ))}
          </div>
        </div>
        {/* </Container> */}
      </div>
    
  );
}
