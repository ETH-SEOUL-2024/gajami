import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Profile } from "./Profile.style";
// eslint-disable-next-line import/no-cycle
import { useAuthState } from "../../hooks/useAuthState";
import { UserBalance, UserInfo } from "../../lib/serverType";

function SkillCard({ skillInfo }: { skillInfo: any }) {
  const [isFlip, setFlip] = useState(false);

  const handleShowSkill = () => {
    console.log("skillInfo:", skillInfo);
    setFlip(!isFlip);
  };

  const ethRewardDisplay = skillInfo.rewarded
    ? `${skillInfo.reward.ethBalance} ETH`
    : "0 ETH";
  const nearRewardDisplay = skillInfo.rewarded
    ? `${skillInfo.reward.nearBalance} NEAR`
    : "0 NEAR";

  return (
    <section className="card" onClick={handleShowSkill}>
      <div className="card-content">
        <div className="media-text-content" data-is-flip={isFlip}>
          <div className="header">
            <div className="header-content">
              <div className="monogram">
                <img
                  src="https://i.ibb.co/P6pGSyd/logo.png"
                  alt="logo"
                  width={40}
                  height={40}
                />
              </div>
              <div className="text">
                <h3 className="text-header title-medium">Eth Seoul</h3>
                <h4 className="text-subhead body-medium">2024</h4>
              </div>
            </div>
          </div>
          <div className="media">
            <img
              src="https://www.ethseoul.org/img/dragon.svg"
              alt=""
              width="100%"
              height={200}
            />
          </div>
          <div className="text-content">
            <div className="headline">
              <h3 className="headline-title body-large">Tokens</h3>
              <div className="tokens">
                <img
                  src="https://i.ibb.co/LzCjtK1/Cjdowner-Cryptocurrency-Flat-Ethereum-ETH-512.png"
                  alt="ethereum-icon"
                  width={40}
                  height={40}
                />
                <div className="near-logo">
                  <img
                    src="https://i.ibb.co/tZyrYxP/near-protocol-near-logo.png"
                    alt="near-logo"
                    width={22}
                    height={22}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="media-skill-content" data-is-flip={isFlip}>
          <div className="header">
            <div className="header-content">
              <div className="text">
                <h3 className="text-header title-medium">Skills</h3>
              </div>
            </div>
          </div>
          <div className="media">
            {Object.entries<any>(skillInfo.data).map(
              ([skill, level], index) => (
                <p className="body-medium" key={index}>
                  {skill.charAt(0).toUpperCase() + skill.slice(1)}
                  {/* <strong>{level}</strong> */}
                </p>
              )
            )}
          </div>
          <div className="text-content">
            {!skillInfo.rewarded && (
              <h3 className="headline-title body-large">Not Claimed Yet</h3>
            )}
            {skillInfo.rewarded && (
              <div className="headline">
                <h3 className="headline-title body-large">Claimed</h3>
                {/* <h4 className="text-subhead body-medium">1 ETH</h4>
              <h4 className="text-subhead body-medium">3 NEAR</h4> */}
                <h4 className="text-subhead body-medium">{ethRewardDisplay}</h4>
                <h4 className="text-subhead body-medium">
                  {nearRewardDisplay}
                </h4>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfilePage() {
  const navigate = useNavigate();
  const { authenticated } = useAuthState();
  const [accountId, setAccountId] = useState("");
  const [ethAddress, setEthAddress] = useState("");
  const [nearBalacne, setNearBalacne] = useState("0");
  const [ethBalance, setEthBalance] = useState("0");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // eslint-disable-next-line consistent-return
  const fetchUserInfo = async () => {
    console.log("fetchUserInfo accountId:", accountId);
    if (accountId === "" || accountId === "loading") return null;
    const userInfoResponse: UserInfo =
      await window.fastAuthController.getUserInfo(accountId);
    console.log(userInfoResponse);
    setUserInfo(userInfoResponse);
    setEthAddress(userInfoResponse.user.ethAddress);
    setEthBalance(userInfoResponse.user.ethBalance);
    setNearBalacne(userInfoResponse.user.nearBalance);
  };

  useEffect(() => {
    setAccountId("loading");
    if (authenticated !== "loading" && authenticated === false) {
      navigate("/login");
    } else if (authenticated) {
      const getAccountId = window.fastAuthController.getAccountId();
      setAccountId(getAccountId);
    }

    console.log("setAccoountId:", window.fastAuthController.getAccountId());
    setAccountId(window.fastAuthController.getAccountId());
    fetchUserInfo();
  }, [authenticated, navigate]);

  useEffect(() => {
    fetchUserInfo();
  }, [accountId]);

  const fetchUserBalance = async () => {
    const userBalance: UserBalance =
      await window.fastAuthController.getUserBalance(accountId);
    console.log(userBalance);

    setEthBalance(userBalance.ethBalance);
    setNearBalacne(userBalance.nearBalance);
    fetchUserInfo();
  };

  return (
    <Profile>
      <article className="article header">
        <div className="back">
          <a href="/">
            <img
              src="https://i.ibb.co/QfbPcXd/leading-Icon.png"
              alt="back"
              width={48}
              height={48}
            />
          </a>
        </div>
        <div className="title">
          <p className="title-large">Profile</p>
        </div>
        <div className="empty1" />
      </article>
      <article className="article profile">
        {/* <input
          type="text"
          className="snackbar body-medium"
          value={accountId}
          readOnly
          style={{ cursor: "pointer" }}
          onClick={() =>
            window.open(
              `https://testnet.nearblocks.io/address/${accountId}`,
              "_blank"
            )
          }
        /> */}
        <section className="list">
          <button className="button" onClick={fetchUserBalance}>
            Refresh Balance
          </button>
          <div className="item">
            <div className="layer">
              <div className="element">
                <div className="building-blocks">
                  <img
                    src="https://i.ibb.co/LzCjtK1/Cjdowner-Cryptocurrency-Flat-Ethereum-ETH-512.png"
                    alt="ethereum-icon"
                    width={40}
                    height={40}
                  />
                </div>
              </div>
              <div className="content body-large">
                <a
                  href={`https://sepolia.etherscan.io/address/${ethAddress}`}
                  target="_blank"
                >
                  {ethAddress.slice(0, 7)}
                  {ethAddress.length > 0 ? "..." : ""}
                  {ethAddress.slice(-5)}
                </a>
                <span>${ethBalance} ETH</span>
              </div>
            </div>
          </div>
          <div className="item">
            <div className="layer">
              <div className="element">
                <div className="building-blocks">
                  <div className="near-logo">
                    <img
                      src="https://i.ibb.co/tZyrYxP/near-protocol-near-logo.png"
                      alt="near-logo"
                      width={22}
                      height={22}
                    />
                  </div>
                </div>
              </div>
              <div className="content body-large">
                <a
                  href={`https://testnet.nearblocks.io/address/${accountId}`}
                  target="_blank"
                >
                  {accountId}
                </a>
                <span>${nearBalacne} NEAR</span>
              </div>
            </div>
          </div>
        </section>
      </article>
      <article className="article result">
        {accountId === "" || accountId === "loading"
          ? null
          : !userInfo || !userInfo.skills
          ? null
          : userInfo?.skills.map((skillInfo, index) => (
              <SkillCard key={index} skillInfo={skillInfo} />
            ))}
        {/* <section className="card" onClick={handleShowSkill}>
          <div className="card-content">
            <div className="media-text-content" data-is-flip={isFlip}>
              <div className="header">
                <div className="header-content">
                  <div className="monogram">
                    <img
                      src="https://i.ibb.co/P6pGSyd/logo.png"
                      alt="logo"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="text">
                    <h3 className="text-header title-medium">Eth Seoul</h3>
                    <h4 className="text-subhead body-medium">2024</h4>
                  </div>
                </div>
              </div>
              <div className="media">
                <img
                  src="https://www.ethseoul.org/img/dragon.svg"
                  alt=""
                  width="100%"
                  height={200}
                />
              </div>
              <div className="text-content">
                <div className="headline">
                  <h3 className="headline-title body-large">Tokens</h3>
                  <div className="tokens">
                    <img
                      src="https://i.ibb.co/LzCjtK1/Cjdowner-Cryptocurrency-Flat-Ethereum-ETH-512.png"
                      alt="ethereum-icon"
                      width={40}
                      height={40}
                    />
                    <div className="near-logo">
                      <img
                        src="https://i.ibb.co/tZyrYxP/near-protocol-near-logo.png"
                        alt="near-logo"
                        width={22}
                        height={22}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="media-skill-content" data-is-flip={isFlip}>
              <div className="header">
                <div className="header-content">
                  <div className="text">
                    <h3 className="text-header title-medium">Skills</h3>
                  </div>
                </div>
              </div>
              <div className="media">
                <p className="body-medium">
                  Java:
                  {' '}
                  <strong>A</strong>
                </p>
                <p className="body-medium">
                  Solidity:
                  {' '}
                  <strong>B</strong>
                </p>
                <p className="body-medium">
                  Rust:
                  {' '}
                  <strong>C</strong>
                </p>
                <p className="body-medium">
                  Go:
                  {' '}
                  <strong>D</strong>
                </p>
                <p className="body-medium">
                  Javascript:
                  {' '}
                  <strong>E</strong>
                </p>
              </div>
              <div className="text-content">
                <div className="headline">
                  <h3 className="headline-title body-large">Claimed</h3>
                  <h4 className="text-subhead body-medium">1 ETH</h4>
                  <h4 className="text-subhead body-medium">3 NEAR</h4>
                </div>
              </div>
            </div>
          </div>
        </section> */}
        {/* <section className="skills">
          <h3 className="skills-title body-large">Skills</h3>
          {renderSkills()}
        </section> */}
      </article>
    </Profile>
  );
}

export default ProfilePage;
