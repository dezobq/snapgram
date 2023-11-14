import { Route, Routes } from 'react-router-dom'
import AuthLayout from './_auth/AuthLayout.tsx'
import SigninForm from './_auth/forms/SigninForm.tsx'
import SignupForm from './_auth/forms/SignupForm.tsx'
import RootLayout from './_root/RootLayout.tsx'
import { AllUsers, CreatePost, EditPost, Explore, Home, PostDetails, Profile, Saved, UpdateProfile } from './_root/pages'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"

const App = () => {
  return (
    <main className="flex h-screen">
      <Routes>
        {/* public routes */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SigninForm />} />
          <Route path="/sign-up" element={<SignupForm />} />
        </Route>

        {/* private routes */}
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path='/explore' element={<Explore />} />
          <Route path='/saved' element={<Saved />} />
          <Route path='/all-users' element={<AllUsers />} />
          <Route path='/create-post' element={<CreatePost />} />
          <Route path='/update-post/:id' element={<EditPost />} />
          <Route path='/posts/:id/' element={<PostDetails />} />
          <Route path='/profile/:id/*' element={<Profile />} />
          <Route path='/update-profile/:id' element={<UpdateProfile />} />
          <Route path='/liked-posts/:id' element={<Profile />} />
        </Route>
      </Routes>
      <Toaster />
    </main>
  )
}

export default App
