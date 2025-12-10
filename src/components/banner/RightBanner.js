import { cartoonMe } from "../../assets/index";

const RightBanner = () => {
  return (
    <div className="w-full lgl:w-1/2 flex justify-center items-center relative">
      <img
        className="z-10 w-96 h-auto" 
        src={cartoonMe}
        alt="cartoonMe"
      />
    </div>
  );
}

export default RightBanner