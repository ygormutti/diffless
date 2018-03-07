# diffless

An extensible, programming language aware, high signal-to-noise ratio diff tool.

## Why?

Have you ever...

 * refactored and styled code, tried to review the changes and had hard times understanding what *really* changed?
 * gave up understanding diff output and decided to just read the entire code
 * redid your changes atop another version to feel safe while merging branches, or even worse...
 * avoided branching and concurrent work on the same code fearing merge conflicts
 * tried "smart" diff tools that...
   * didn't support the language you were using;
   * were closed source, so you couldn't implement support for it either;
   * were halfway done or hard to use? (like most academic tools)

If so, diffless was made specially for you.

## What?

The idea behind diffless is that the more you use it, the less you use it. :)

Ok, let me rephrase that... if diffless becomes your diff tool of choice you will spend less time reading diff outputs, because you will understand changes faster.

Even if it doesn't support the programming language of what you're comparing you can get an improved diff output out of it, and you can easily extend it too, adding support for your favorite languages, creating your own view for it, integrating it with your code editor, unit testing library, etc.

## How?

diffless is all about converters. Converters are pluggable building blocks that take instances of one type and convert them to other type. For example, one could write an zip-to-directory converter so that when diffless receives a zip file and a directory as inputs it will know that it can use this converter to make both arguments of same type and will be able to compare them. The input and output types of the converter are not necessarily different. For example, one could a JSON formatter converter, that takes a JSON and outputs the same JSON pretty-printed (to ease diff visibility).

It can use programming language parsers to better assess the code being compared and determine the importance of each change. Parsers are converters too! For example, a JavaScript tokenizer would convert JavaScript source code into a sequence of tokens, and a comparer converter could convert a pair of token sequences into one diff result, an abstraction provided by diffless itself, that store everything needed to display the changes in any view.

Also, depending on the algorithms plugged in, it could use some nifty techniques to detect more changes than line additions/removals, like block copies between files and some refactorings.

The better of all is that all those techniques are not dependent on any specific programming language so, once you integrate a new parser with diffless, you get them for free.

It achieves that by converters, which can be of: comparers and converters, which can be parsers and decoders.

### Comparers

The comparers do the heavy-lifting in diffless, defining the model comparing any kind of data structure.

Currently, the only available algorithm plugin supports sequence comparison. I dream of writing more algorithms in the future, to compare trees and graphs, and even data flows. Anyone can develop algorithms, and

### Decoders

A decoder is useful to compare 

### Parsers
