import styled from "styled-components";

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
      <StyledWrapper>
        <div className="ticket-loader">
          <span>Loading...</span>
        </div>
      </StyledWrapper>
    </div>
  );
};

const StyledWrapper = styled.div`
  .ticket-loader {
    width: 140px;
    height: 60px;
    background: linear-gradient(45deg, #ffcc00, #ff6600);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    border-radius: 10px;
    box-shadow: 0px 0px 15px rgba(255, 102, 0, 0.5);
    position: relative;
    animation: flicker 1.5s infinite alternate ease-in-out;
  }

  .ticket-loader::before,
  .ticket-loader::after {
    content: "";
    position: absolute;
    width: 10px;
    height: 10px;
    background: #222;
    border-radius: 50%;
  }

  .ticket-loader::before {
    left: -5px;
  }

  .ticket-loader::after {
    right: -5px;
  }

  @keyframes flicker {
    0% { transform: scale(1); box-shadow: 0px 0px 10px rgba(255, 102, 0, 0.3); }
    100% { transform: scale(1.1); box-shadow: 0px 0px 20px rgba(255, 102, 0, 0.7); }
  }
`;

export default Loader;
