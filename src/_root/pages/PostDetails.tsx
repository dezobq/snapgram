import Loader from '@/components/shared/Loader'
import PostStats from '@/components/shared/PostStats.1'
import { Button } from '@/components/ui/button'
import { useUserContext } from '@/context/AuthContext'
import { useGetPostById } from '@/lib/react-query/queriesAndMutations'
import { multiFormatDateString } from '@/lib/utils'
import { Link, useParams } from 'react-router-dom'

const PostDetails = () => {
  const { user } = useUserContext()
  const { id } = useParams()
  const { data: post, isPending } = useGetPostById(id || '')

  const handleDeletePost = () => {}

  return (
    <div className="post_details-container">
      {/* Display loader if data is pending, otherwise show post details */}
      {isPending ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          {/* Display the post image */}
          <img src={post?.imageUrl} alt="post" className="post_details-img" />

          {/* Post details including the post creator, date, and edit link */}
          <div className="post_details-info">
            {/* Link to the post creator's profile */}
            <div className="flex-between w-full">
              <Link
                to={`/profile/${post?.creator.$id}`}
                className="flex items-center gap-3"
              >
                {/* Post creator's image */}
                <img
                  src={
                    post?.creator?.imageUrl ||
                    '/assets/icons/profile-placeholder.svg'
                  }
                  alt="creator"
                  className="rounded-full w-9 h-9 lg:w-12 lg:lg:h-12"
                />

                {/* Post creator's name, date, and location */}
                <div className="flex flex-col gap-1">
                  <p className="base-medium lg:body-bold text-light-1">
                    {post?.creator.name}
                  </p>
                  <div className="flex-center gap-2 text-light-3">
                    <p className="subtle-semibold lg:small-regular">
                      {multiFormatDateString(post?.$createdAt)}
                    </p>
                    -
                    <p className="subtle-semibold lg:small-regular">
                      {post?.location}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Edit post icon shown only if the user is the post creator */}
              <div className="flex-center gap-4">
                <Link
                  to={`/update-post/${post?.$id}`}
                  className={`${user.id !== post?.creator.$id && 'hidden'}`}
                >
                  <img
                    src={'/assets/icons/edit.svg'}
                    alt="edit"
                    width={24}
                    height={24}
                  />
                </Link>

                {/* Delete post icon shown only if the user is the post creator */}
                <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  className={`ghost_details-delete_btn ${
                    user.id !== post?.creator.$id && 'hidden'
                  }`}
                >
                  <img
                    src={'/assets/icons/delete.svg'}
                    alt="delete"
                    width={24}
                    height={24}
                  />
                </Button>
              </div>
            </div>
            <hr className="border w-full border-dark-4/80" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{post?.caption}</p>
              <ul className="flex gap-1 mt-2">
                {post?.tags.map((tag: string) => (
                  <li key={tag} className="text-light-3">
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full">
              <PostStats post={post} userId={user.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostDetails
