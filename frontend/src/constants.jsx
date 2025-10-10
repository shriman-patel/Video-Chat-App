export const LANGUAGE_VERSIONS = {
  javascript: "18.15.0",
  typescript: "5.0.3",
  python: "3.10.0",
  c: "10.2.0",
  dragon: "1.9.8", // Format A: Compiler version number
  cpp: "10.2.0",
  fortran: "10.2.0",
  pascal: "3.2.2",
  java: "15.0.2",
  csharp: "6.12.0",
  swift: "5.3.3",
  php: "8.2.3",
};

export const CODE_SNIPPETS = {
  javascript: `\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`,
  typescript: `\ntype Params = {\n\tname: string;\n}\n\nfunction greet(data: Params) {\n\tconsole.log("Hello, " + data.name + "!");\n}\n\ngreet({ name: "Alex" });\n`,
  python: `\ndef greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Alex")\n`,
  c: `#include <stdio.h>\n\nint main() {\n\tprintf("Hello from C!\\n");\n\treturn 0;\n}`,
  cpp: `#include <iostream>\n\nint main() {\n\tstd::cout << "Hello from C++!" << std::endl;\n\treturn 0;\n}`,
  java: `\npublic class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}\n`,
  csharp:
    'using System;\n\nnamespace HelloWorld\n{\n\tclass Hello { \n\t\tstatic void Main(string[] args) {\n\t\t\tConsole.WriteLine("Hello World in C#");\n\t\t}\n\t}\n}\n',
  php: "<?php\n\n$name = 'Alex';\necho $name;\n",
  dragon: `\nprint("Hello from Dragon!")\n`,
  fortran: `program hello\n  implicit none\n  write(*,*) 'Hello from Fortran!'\nend program hello`,
  pascal: `program HelloWorld;\nbegin\n  writeln('Hello from Pascal!');\nend.`,
  swift: `\nprint("Hello from Swift!")\n`,
};
