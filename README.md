# diffless

An extensible diff tool with high signal-to-noise ratio.

## Why?

Have you ever...

 * did some code styling or refactoring, tried to review the changes and had hard times understanding what *really* changed?
 * gave up understanding the diff and decided to just read the entire code, or even worse, redo the changes atop another version to feel safe?
 * had nightmares about merging conflicts that made you avoid branching and concurrent work at all costs?
 * tried "smart diff tools" that...
   * didn't support the language you were interested in;
   * were closed source, so you couldn't implement support for it either;
   * were halfway done or hard to use?

If so, diffless was made specially for you.

## How?

The idea is that the more you use diffless, you'll probably spend less time using any diff, and if it doesn't support your favorite language you can easily add suport for it.

It achieves that by means of three kinds of plugins: converters (which can be decoders and parsers) and comparers.

### Algorithms

The algorithm plugins do the heavy-lifting of diffless, comparing any kind of

### Decoders

A decoder is useful to compare 

### Parsers
