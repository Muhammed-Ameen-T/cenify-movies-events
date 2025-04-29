import styled from "styled-components";

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-md flex items-center justify-center z-50">
      <StyledWrapper>
        <div className="loader" />
      </StyledWrapper>
    </div>
  );
};

const StyledWrapper = styled.div`
  .loader {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    position: relative;
    background: radial-gradient(circle, #666 10%, transparent 70%);
    animation: rotate 1.6s infinite linear;
    box-shadow: 0px 0px 12px rgba(102, 102, 102, 0.3);
  }

  .loader:before,
  .loader:after {
    content: "";
    position: absolute;
    inset: 0;
    background: inherit;
    border-radius: 50%;
    opacity: 0.8;
    animation: pulse 1.6s infinite ease-in-out;
  }

  .loader:after {
    animation-delay: 0.8s;
  }

  @keyframes rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

export default Loader;
