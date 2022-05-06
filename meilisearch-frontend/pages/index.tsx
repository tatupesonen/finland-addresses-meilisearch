import { Center, Container, Heading, Input, List, ListItem, Stack } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { SearchResult } from "./api/search";

const Home: NextPage = () => {
  const [input, setInput] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);

  useEffect(() => {
    fetch("api/search", {
      method: "POST",
      body: JSON.stringify({ q: input }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => setSearchResult(data));
  }, [input]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Finnish addresses lookup</title>
      </Head>
      <Container mt={24}>
        <Stack direction="column">
          <Heading as="h1">Finnish addresses lookup</Heading>
          <Input value={input} onChange={onInputChange} />
          <List>
            {searchResult &&
              searchResult?.hits?.map((hit) => (
                <ListItem>
                  {hit.street} {hit.house_number}
                </ListItem>
              ))}
          </List>
        </Stack>
      </Container>
    </div>
  );
};

export default Home;
