import React, {
  Fragment, useEffect, useRef, useState
} from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';

import AuthIndicatorButton from './AuthIndicatorButton';
import { useAuthState } from '../../hooks/useAuthState';
import { ChatResponse } from '../../lib/serverType';

const Chat = styled.main`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #15121b;

  /* empty block area start */
  .empty1 {
    grid-column: span 1;
  }

  .empty2 {
    grid-column: span 2;
  }

  .empty7 {
    grid-column: span 7;
  }
  /* empty block area end */

  /* font area start */
  .title-large {
    font-family: "Roboto";
    font-style: normal;
    font-weight: 400;
    font-size: 22px;
    line-height: 28px;
    text-align: center;
    color: #e6e0e9;
  }

  .body-large {
    font-family: "Roboto";
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.5px;
    color: #e6e0e9;
  }

  .body-medium {
    font-family: "Roboto";
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: #e6e0e9;
  }

  .label-large {
    font-family: "Roboto";
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.1px;
    color: #d0bcff;
  }
  /* font area end */

  .article {
    display: grid;
    grid-template-columns: repeat(12, 72px);
    justify-content: center;
    gap: 24px;
  }

  .title {
    grid-column: span 10;
    align-content: center;
  }

  .header {
    height: 64px;
    align-content: center;
  }

  .bottom {
    width: 100%;
    position: fixed;
    bottom: 50px;
  }

  .profile {
    display: flex;
    justify-content: center;
  }

  .chat-list {
    height: Calc(100vh - 180px);
    overflow-y: auto;
  }

  .chat-item {
    margin-top: 42px;
    margin-bottom: 42px;
  }

  .chat {
    grid-column: span 4;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0 0 8px;
    gap: 8px;
    background: #211f26;
    box-shadow: 0px 2px 6px 2px rgba(0, 0, 0, 0.15),
      0px 1px 2px rgba(0, 0, 0, 0.3);
    border-radius: 12px;

    .content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 12px 16px 4px;
      gap: 4px;

      .receipe {
        background: #0d002f;
        align-self: stretch;
        padding: 10px;
      }
    }

    .action {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 0 8px;
      gap: 8px;
      flex: none;
      align-self: stretch;
      flex-grow: 0;

      .transactions {
        padding: 12px 16px 4px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
    }
  }

  .chat-field {
    grid-column: span 7;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0 0 0 15px;
    gap: 10px;
    isolation: isolate;
    background: #36343b;
    border-radius: 4px 4px 0 0;
    flex: none;
    align-self: stretch;
    flex-grow: 1;
    height: 56px;
    border: none;
    border-bottom: 1px solid #cac4d0;
  }

  .chat-field:disabled {
    background: #1d1a23;
  }

  .chat-field::placeholder {
    color: #cac4d0;
  }

  .submit {
    grid-column: span 1;
    align-content: center;
  }

  .primary-button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0;
    border-radius: 100px;
    flex: none;
    flex-grow: 0;
    cursor: pointer;

    .state-layer {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 10px 12px;
      gap: 8px;
      flex: none;
      order: 0;
      align-self: stretch;
      flex-grow: 0;
      background: #8658e5;
      border-radius: 12px;
    }
  }

  .button:disabled {
    background: #36343b;
  }

  .button {
    padding: 0;
    width: 84px;
    height: 40px;
    background: #8850c7;
    border-radius: 100px;
    border: none;
    color: #ddb9ff;
    font-family: "Roboto";
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 40px;
    letter-spacing: 0.1px;
    text-align: center;
  }

  @media screen and (min-width: 1240px) and (max-width: 1439px) {
    .article {
      padding: 0 200px;
      grid-template-columns: repeat(12, 1fr);
    }
  }

  @media screen and (min-width: 905px) and (max-width: 1239px) {
    .article {
      padding: 0 24px;
      grid-template-columns: repeat(12, 1fr);
    }
  }

  @media screen and (min-width: 600px) and (max-width: 904px) {
    .article {
      padding: 0 24px;
      grid-template-columns: repeat(8, 1fr);
    }

    .empty2 {
      grid-column: span 1;
    }

    .empty7 {
      grid-column: span 3;
    }

    .title {
      grid-column: span 6;
    }

    .chat-field {
      grid-column: span 5;
    }
  }

  @media screen and (max-width: 599px) {
    .article {
      padding: 0 24px;
      grid-template-columns: repeat(4, 1fr);
    }

    .section {
      grid-column: span 4;
    }

    .empty1,
    .empty2 {
      display: none;
    }

    .empty7 {
      grid-column: span 1;
    }

    .chat {
      grid-column: span 3;
    }

    .title {
      grid-column: span 3;
    }

    .chat-field {
      grid-column: span 3;
    }
  }
`;

function ClaimButton({ skillId }) {
  const [pending, setPending] = useState(false);
  const [tx, setTx] = useState(null);
  const handleClaim = async () => {
    setPending(true);
    const res = await window.fastAuthController.claimSkill(skillId);
    setPending(false);
    setTx(res);
  };

  return (
    <>
      {tx ? (
        <div className="transactions">
          {tx.ethTxHash !== '' ? (
            <a
              href={`https://sepolia.etherscan.io/tx/${tx.ethTxHash}`}
              target="_blank"
              rel="noreferrer"
            >
              ETH:
              {' '}
              {tx.ethBalance}
            </a>
          ) : null}
          {tx.nearTxHash !== '' ? (
            <a
              href={`https://testnet.nearblocks.io/txns/${tx.nearTxHash}`}
              target="_blank"
              rel="noreferrer"
            >
              NEAR:
              {' '}
              {tx.nearBalance}
            </a>
          ) : null}
        </div>
      ) : (
        <div
          className="primary-button"
          onClick={() => (!pending ? handleClaim() : null)}
        >
          <div className="state-layer label-large">
            {pending ? 'Claiming..' : 'Claim'}
          </div>
        </div>
      )}
    </>
  );
}

function AuthIndicator() {
  const { authenticated } = useAuthState();
  const navigate = useNavigate();
  const [accountId, setAccountId] = useState('');
  const [chatList, setChatList] = useState([]);
  const questionRef = useRef<any>();

  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   const receiverId = 'v1.social08.testnet';

  //   // todo improvement
  //   const args = {
  //     data: {
  //       [accountId]: {
  //         profile: {
  //           skill: {
  //             java:     javaSkill,
  //             solidity: soliditySkill,
  //           },
  //         },
  //       },
  //     },
  //   };
  //   await window.fastAuthController.loadSocialDB({ receiverId, args });
  // };

  const handleQuestion = async () => {
    setChatList([...chatList, questionRef.current.value]);
    questionRef.current.value = '';
  };

  useEffect(() => {
    if (authenticated !== 'loading' && authenticated === false) {
      navigate('/login');
    } else if (authenticated) {
      const getAccountId = window.fastAuthController.getAccountId();
      setAccountId(getAccountId);
    }
  }, [authenticated, navigate]);

  useEffect(() => {
    const callChatGPT = async (question) => {
      setChatList([
        ...chatList,
        {
          message:   'pending...',
          isPending: true,
          skillData: [],
          skillId:   null,
        },
      ]);
      const res: ChatResponse = await window.fastAuthController.postChatToGPT(
        question
      );

      setChatList([
        ...chatList,
        {
          message:   res.explanation,
          isPending: false,
          skillData: res.skillData,
          skillId:   res.skillId,
        },
      ]);
    };

    if (chatList.length % 2 === 1) {
      callChatGPT(chatList[chatList.length - 1]);
    }
  }, [chatList]);

  return (
    <Chat>
      <article className="article header">
        <div className="empty1" />
        <div className="title">
          <p className="title-large">chat</p>
        </div>
        <div className="profile">
          <a href="/profile">
            <img
              src="https://i.ibb.co/JpC2CMF/trailing-icon.png"
              alt="avatar"
              width={48}
              height={48}
            />
          </a>
        </div>
      </article>
      <div className="chat-list">
        {chatList.map<any>((chat, index) => {
          if (index % 2 === 0) {
            return (
              <article className="article chat-item" key={`${chat}-${index}`}>
                <div className="empty7" />
                <section className="chat">
                  <div className="content">
                    <div className="body-medium">{chat}</div>
                  </div>
                </section>
                <div className="empty1" />
              </article>
            );
          }

          return (
            <article className="article chat-item" key={`${chat}-${index}`}>
              <div className="empty1" />
              <section className="chat">
                <div className="content">
                  <p className="body-medium">{chat.message}</p>
                  {chat.skillData.length > 0 ? (
                    <code className="receipe">
                      {chat.skillData.map((skill, index) => (
                        <Fragment key={`${skill}`}>
                          {`${skill}`}
                          {index > chat.skillData.length ? null : <br />}
                        </Fragment>
                      ))}
                    </code>
                  ) : null}
                </div>
                {chat.isPending ? null : (
                  <div className="action">
                    <ClaimButton skillId={chat.skillId} />
                  </div>
                )}
              </section>
            </article>
          );
        })}
      </div>
      <article className="article bottom">
        <div className="empty2" />
        <input
          type="text"
          className="chat-field body-large"
          name="chat"
          id="chat"
          placeholder={
            chatList.length >= 2
            && chatList.length % 2 === 0
            && chatList[chatList.length - 1].isPending
              ? 'please wait for response...'
              : 'write your chat.'
          }
          disabled={
            chatList.length >= 2
            && chatList.length % 2 === 0
            && chatList[chatList.length - 1].isPending
          }
          ref={questionRef}
        />
        <div className="submit">
          <button
            className="button"
            disabled={
              chatList.length >= 2
              && chatList.length % 2 === 0
              && chatList[chatList.length - 1].isPending
            }
            onClick={handleQuestion}
          >
            {chatList.length >= 2
            && chatList.length % 2 === 0
            && chatList[chatList.length - 1].isPending
              ? 'Submitting...'
              : 'Submit'}
          </button>
        </div>
        <div className="empty2" />
      </article>

      {/* <AuthIndicatorButton
        data-test-id="auth-indicator-button"
        $buttonType="secondary"
        $isSignedIn={authenticated && authenticated !== "loading"}
      >
        {authenticated ? <p>signed in</p> : <p>not signed in</p>}
      </AuthIndicatorButton> */}
      {/* <form onSubmit={handleSubmit}>
        <div>
          Java Skill:
          <input
            id="javaSkill"
            type="text"
            value={javaSkill}
            onChange={(e) => setJavaSkill(e.target.value)}
          />
        </div>
        <div>
          Solidity Skill:
          <input
            id="soliditySkill"
            type="text"
            value={soliditySkill}
            onChange={(e) => setSoliditySkill(e.target.value)}
          />
        </div>
        <button type="submit">Submit</button>
      </form> */}
      {/* <Button onClick={handleTx}>handleTx</Button> */}
    </Chat>
  );
}

export default AuthIndicator;
