import { ID, Query } from 'appwrite';
import { INewPost, INewUser, IUpdatePost } from "@/types";
import { account, appwriteConfig, avatars, databases, storage } from './config';


// User-related functionalities

export async function createUserAccount(user:INewUser) {

try {
  const newAccount = await account.create(
    ID.unique(),
    user.email,
    user.password,
    user.name
  );

  if(!newAccount) throw Error;

  const avatarUrl = avatars.getInitials(user.name);

  const newUser = await saveUserToDB({
    accountId: newAccount.$id,
    name: newAccount.name,
    email: newAccount.email,
    username: user.username,
    imageUrl: avatarUrl,
  });


  return newUser;

} catch (error) {
  console.log(error);
  return error;
  
}

}

export async function saveUserToDB(user: {
  accountId:string;
  email:string;
  name:string;
  imageUrl:URL;
  username?:string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user,
    )
    return newUser;
    
  } catch (error) {
    console.log(error);
  }
}

export async function signInAccount(user: { email: string; password: string}) {
  try {
    const session = await account.createEmailSession(user.email, user.password);
    return session;
  } catch (error) {
    console.log(error);
  }
}

export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();

    if(!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [ Query.equal('accountId', currentAccount.$id) ]
    )

    if(!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
}

export async function signOutAccount() {
  try {
    const session = await account.deleteSession('current');
    return session;
  } catch (error) {
    console.log(error);
  }
}


// Post-related functionalities

export async function createPost(post: INewPost) {
  try {
    
    const uploadedFile = await uploadFile(post.file[0]);

    if(!uploadedFile) throw Error;

    //get file preview url
    const fileUrl = getFilePreview(uploadedFile.$id);


    if(!fileUrl) {
      deleteFile(uploadedFile.$id);
       throw Error;}
 

    const tags = post.tags?.replace(/ /g, '').split(',') || [];


    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    );

    if(!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;}

    return newPost;


  } catch (error) {
    console.log(error);
  }
}

export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file);
      return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      "top",
      100
    );
    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function savePost(userId: string, postId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error;

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

export async function getPostById(postId: string) {
  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    // Initialize image object with existing data
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    // If there's a new file to update
    if (hasFileToUpdate) {
      // Upload the new file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);

      // Check if file upload failed
      if (!uploadedFile) {
        throw new Error("Failed to upload file");
      }

      // Get the URL of the newly uploaded file
      const fileUrl = getFilePreview(uploadedFile.$id);

      // If file URL retrieval fails, delete the uploaded file and throw an error
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw new Error("Failed to get file preview URL");
      }

      // Update image object with new file details
      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Convert tags into an array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Update the post in the database with new/updated information
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    // If the update operation fails
    if (!updatedPost) {
      // If there was a new file uploaded, delete it
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      throw new Error("Failed to update post");
    }

    // If there was a new file uploaded, safely delete the old file after a successful update
    if (hasFileToUpdate) {
      await deleteFile(post.imageId);
    }

    return updatedPost; // Return the updated post
  } catch (error) {
    console.log(error); // Log any errors that occur during the process
  }
}
export async function deletePost(postId?: string, imageId?: string) {
  // If either postId or imageId is missing, exit the function
  if (!postId || !imageId) return;

  try {
    // Delete the post from the database
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    // If deletion fails, throw an error
    if (!statusCode) {
      throw new Error("Failed to delete post from database");
    }

    // Delete the associated image file
    await deleteFile(imageId);

    // Return status indicating successful deletion
    return { status: "Ok" };
  } catch (error) {
    console.log(error); // Log any errors that occur during the process
  }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function searchPosts(searchTerm: string) {
  
  try {
    const posts =await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search('caption', searchTerm)]
    );
    if(!posts) throw Error;

    return posts;
    
  } catch (error) {
    console.log(error);
  }
}