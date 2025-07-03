export default function Loading() {
    return (
      <div className="container mx-auto px-4 py-12 animate-pulse">
        <div className="max-w-3xl mx-auto">
          <div className="h-6 w-24 bg-gray-200 rounded mb-8"></div>
  
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <div className="aspect-square rounded-xl bg-gray-200"></div>
            </div>
  
            <div className="md:w-1/2 space-y-4">
              <div>
                <div className="h-4 w-32 bg-gray-200 rounded mb-1"></div>
                <div className="h-10 bg-gray-200 rounded-lg"></div>
              </div>
  
              <div>
                <div className="h-4 w-32 bg-gray-200 rounded mb-1"></div>
                <div className="h-10 bg-gray-200 rounded-lg"></div>
              </div>
  
              <div>
                <div className="h-4 w-32 bg-gray-200 rounded mb-1"></div>
                <div className="h-10 bg-gray-200 rounded-lg"></div>
              </div>
  
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
  
              <div className="h-12 bg-gray-200 rounded-lg"></div>
  
              <div className="h-3 w-full bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }