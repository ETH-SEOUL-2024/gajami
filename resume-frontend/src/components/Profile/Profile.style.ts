import styled from "styled-components";

export const Profile = styled.main`
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

  .title-medium {
    font-family: "Roboto";
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.15px;
    color: #e6e0e9;
  }

  .body-large {
    font-family: "Roboto";
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.5px;
    color: #ddb9ff;
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
  /* font area end */

  .article {
    display: grid;
    grid-template-columns: repeat(12, 72px);
    justify-content: center;
    gap: 24px;
  }

  .header {
    height: 64px;
    align-content: center;
  }

  .title {
    grid-column: span 10;
    align-content: center;
  }

  .profile {
    margin-top: 46px;
  }

  .snackbar {
    grid-column: span 3;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 14px 16px;
    gap: 4px;
    background: #e6e0e9;
    height: 20px;
    color: #322f35;
  }

  .back {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .result {
    margin: 50px 0;
  }

  .list {
    grid-column: span 12;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0;
    background: #141218;

    .item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 0;
      isolation: isolate;
      width: 100%;
      height: 56px;
      min-height: 56px;
      background: #211f26;

      flex: none;
      order: 0;
      align-self: stretch;
      flex-grow: 0;

      .layer {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 8px 24px 8px 16px;
        gap: 16px;
        flex: none;
        order: 1;
        align-self: stretch;
        flex-grow: 0;

        .element {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          padding: 0;
          width: 40px;
          height: 40px;

          flex: none;
          order: 0;
          flex-grow: 0;

          .building-blocks {
            width: 40px;
            height: 40px;
            border-radius: 100px;
            flex: none;
            order: 0;
            flex-grow: 0;

            .near-logo {
              text-align: center;
              align-content: center;
              border-radius: 100px;
              background: #fff;
              width: 40px;
              height: 40px;
            }
          }
        }

        .content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          padding: 0;
          flex: none;
          order: 1;
          align-self: stretch;
          flex-grow: 1;
          color: #e6e0e9;
        }
      }
    }
  }

  .card {
    grid-column: span 4;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 0;
    isolation: isolate;
    height: 460px;
    border-radius: 12px;
    flex: none;
    background: #211f26;

    .card-content {
      border: 1px solid #49454f;
      border-radius: 12px;
      flex: none;
      order: 0;
      align-self: stretch;
      flex-grow: 1;
      z-index: 1;

      transition: 0.4s;
      transform-style: preserve-3d;
      position: relative;
      perspective: 1100px;

      .media-skill-content {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        display: none;
      }

      .media-skill-content[data-is-flip="true"] {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0;
        backface-visibility: hidden;
        position: absolute;
        width: 100%;
        height: 100%;

        .header {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 12px 4px 12px 16px;
          height: 72px;
          flex: none;
          order: 0;
          align-self: stretch;
          flex-grow: 0;

          .header-content {
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 0;
            gap: 16px;
            flex: none;
            order: 0;
            flex-grow: 1;

            .monogram {
              width: 40px;
              height: 40px;
              flex: none;
              order: 0;
              flex-grow: 0;
              background: #000;
            }

            .text {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              padding: 0;
              gap: 4px;
              flex: none;
              order: 1;
              flex-grow: 1;

              .text-header {
                flex: none;
                order: 0;
                align-self: stretch;
                flex-grow: 0;
              }

              .text-subhead {
                flex: none;
                order: 1;
                flex-grow: 0;
              }
            }
          }
        }

        .media {
          flex: none;
          order: 1;
          align-self: stretch;
          flex-grow: 1;
          height: 260px;
          background: transparent;
          padding: 30px 4px 30px 12px;
          border-top: 1px solid #fff;
          border-bottom: 1px solid #fff;
        }

        .text-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 16px;
          gap: 32px;
          flex: none;
          order: 2;
          align-self: stretch;
          flex-grow: 0;

          .headline {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 0;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;

            .headline-title {
              color: #e6e0e9;
            }

            .tokens {
              display: flex;
              flex-direction: row;
              gap: 14px;
              margin-left: 7px;
              margin-top: 13px;

              .near-logo {
                text-align: center;
                align-content: center;
                border-radius: 100px;
                background: #fff;
                width: 40px;
                height: 40px;
              }
            }
          }
        }
      }

      .media-text-content[data-is-flip="true"] {
        transform: rotateY(180deg);
      }

      .media-text-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0;
        backface-visibility: hidden;
        position: absolute;
        width: 100%;
        height: 100%;

        .header {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 12px 4px 12px 16px;
          height: 72px;
          flex: none;
          order: 0;
          align-self: stretch;
          flex-grow: 0;

          .header-content {
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 0;
            gap: 16px;
            flex: none;
            order: 0;
            flex-grow: 1;

            .monogram {
              width: 40px;
              height: 40px;
              flex: none;
              order: 0;
              flex-grow: 0;
              background: #000;
            }

            .text {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              padding: 0;
              gap: 4px;
              flex: none;
              order: 1;
              flex-grow: 1;

              .text-header {
                flex: none;
                order: 0;
                align-self: stretch;
                flex-grow: 0;
              }

              .text-subhead {
                flex: none;
                order: 1;
                flex-grow: 0;
              }
            }
          }
        }

        .media {
          flex: none;
          order: 1;
          align-self: stretch;
          flex-grow: 1;
          height: 260px;
          background: transparent;
          padding: 30px 0;
          border-top: 1px solid #fff;
          border-bottom: 1px solid #fff;
        }

        .text-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 16px;
          gap: 32px;
          flex: none;
          order: 2;
          align-self: stretch;
          flex-grow: 0;

          .headline {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 0;
            flex: none;
            order: 0;
            align-self: stretch;
            flex-grow: 0;

            .headline-title {
              color: #e6e0e9;
            }

            .tokens {
              display: flex;
              flex-direction: row;
              gap: 14px;
              margin-left: 7px;
              margin-top: 13px;

              .near-logo {
                text-align: center;
                align-content: center;
                border-radius: 100px;
                background: #fff;
                width: 40px;
                height: 40px;
              }
            }
          }
        }
      }
    }
  }

  .button {
    margin: 15px;
    align-self: end;
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

    .snackbar {
      grid-column: span 2;
    }

    .list {
      grid-column: span 8;
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

    .snackbar {
      grid-column: span 4;
    }

    .list {
      grid-column: span 4;
    }
  }
`;
