require "net/http"
require "rake"
require "pathname"

JSDOC = Pathname.new("~/app/jsdoc-toolkit").expand_path

COPYRIGHT = <<EOS
// Rubylike.js (https://github.com/ksss/ruby-enumerator.js)
// Copyright (c) 2013 ksss <co000ri@gmail.com>
EOS

def limited(source)
  source.gsub!(%r|\n?Enumerable\.prototype.*?\n};\n|m, '')
  source.gsub!(%r|\n?Enumerable\.include\s=.*?\n};\n|m, '')
  source.gsub!(%r|\n?Enumerable\.include.*?;\n|m, '')
  source.gsub!(%r|\n?Enumerable\.eql.*?\n};\n|m, '')
  source.gsub!(%r|\nEnumerable.*?;|m, '')
  source.gsub!(%r|\nfunction\sEnumerable.*?;|m, '')
  source.sub!(%r|\n?this\.Enumerable.*?;|, '')
  source = nodoc(source)
end

def mini(source)
  uri = URI.parse('http://closure-compiler.appspot.com/compile')
  req = Net::HTTP::Post.new(uri.request_uri)
  req.set_form_data({
    'js_code'           => source,
    'compilation_level' => 'SIMPLE_OPTIMIZATIONS',
    'output_format'     => 'text',
    'output_info'       => ['compiled_code', 'errors'],
  })
  minified = Net::HTTP::start(uri.host, uri.port) do |http|
    http.request(req).body
  end
  nodoc(minified)
end

def nodoc(source)
  COPYRIGHT + source
    .gsub(%r|\n?/\*.*?\*/\n?|m, '')
    .gsub(%r|\n?\s*//.*|, '')
end

task :default => [:test, :options]

task :test => ["test.js"] do |t|
  sh %{node test-node.js}
end

task :options => ["enumerator.limited.js", "enumerator.mini.js", "enumerator.nodoc.js"] do
end

task "enumerator.limited.js" => ["enumerator.js", "test-limited.js"] do |t|
  File.open(t.name, "w") { |f|
    f << limited(File.read("enumerator.js"))
  }
  sh %{node test-limited.js}
end

task "enumerator.mini.js" => ["enumerator.js"] do |t|
  File.open(t.name, "w") { |f|
    f << mini(File.read("enumerator.js"))
  }
end

task "enumerator.nodoc.js" => ["enumerator.js"] do |t|
  File.open(t.name, "w") { |f|
    f << nodoc(File.read("enumerator.js"))
  }
end

task :doc => ["doc/index.html"] do |t|
end

task "doc/index.html" => ["enumerator.js", "doc/template/class.tmpl", "doc/template/publish.js"] do |t|
  sh %{java -jar #{JSDOC}/jsrun.jar #{JSDOC}/app/run.js -s -d=doc -t=doc/template enumerator.js}
end
