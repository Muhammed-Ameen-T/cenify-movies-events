import { useNavigate } from "react-router-dom";
import { REDIRECT_MESSAGES } from "../../constants/redirect.messges.ts";

const PageNotFound = ({
  title = REDIRECT_MESSAGES.PAGE_NOT_FOUND_TITLE,
  message = REDIRECT_MESSAGES.PAGE_NOT_FOUND_MESSAGE,
  linkText = REDIRECT_MESSAGES.HOME,
  linkTo = "/",
}) => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100 text-gray-800">
      <div className="text-center px-6 max-w-lg">
        <h1 className="text-5xl font-semibold tracking-tight mb-4">{title}</h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">{message}</p>
        <button
          type="button"
          className="px-6 py-3 text-lg font-medium rounded-md border border-gray-400 bg-white shadow-md hover:bg-gray-200 transition-all duration-300"
          onClick={() => navigate(linkTo)}
        >
          {linkText}
        </button>
      </div>
    </div>
  );
};

export default PageNotFound;
