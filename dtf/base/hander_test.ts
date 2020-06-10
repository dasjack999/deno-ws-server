 import {assert, fail, assertEquals} from "https://deno.land/std/testing/asserts.ts";

 Deno.test({
   name: "example test",
   fn(): void {
     assertEquals("world", "world");
   },
 });

 Deno.test({
   name: "example ignored test",
   ignore: Deno.build.os === "windows",
   fn(): void {
    assert(1,'This test is ignored only on Windows machines');
   },
 });

 Deno.test({
   name: "example async test",
   async fn() {
     const decoder = new TextDecoder("utf-8");
     const data = await Deno.readFile("hello_world.txt");
     assertEquals(decoder.decode(data), "Hello world");
   }
 });