import CreatorCard from "@/components/shared/CreatorCard";
import Loader from "@/components/shared/Loader";
import { useToast } from "@/components/ui/use-toast";

import { useGetUsers } from "@/lib/react-query/queriesAndMutations";

const AllUsers = () => {
  const { toast } = useToast();

  // Fetching data of all users using the custom hook useGetUsers
  const { data: creators, isLoading, isError: isErrorCreators } = useGetUsers();

  // Display a toast notification if there is an error fetching users' data
  if (isErrorCreators) {
    toast({ title: "Something went wrong." });
    return; // Return early if there's an error
  }

  return (
    <div className="common-container">
      <div className="user-container">
        {/* Heading for the page */}
        <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>
        {/* Display a loader while fetching data */}
        {isLoading && !creators ? (
          <Loader />
        ) : (
          <ul className="user-grid">
            {/* Mapping through the creators' data to display each user */}
            {creators?.documents.map((creator) => (
              <li key={creator?.$id} className="flex-1 min-w-[200px] w-full">
                {/* Displaying the CreatorCard component for each user */}
                <CreatorCard user={creator} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
