// Minimal ambient types so TS stops complaining on Vercel.
// (We can replace with @types/nodemailer later if you want strict typing.)
declare module "nodemailer" {
  const nodemailer: any;
  export default nodemailer;
}
