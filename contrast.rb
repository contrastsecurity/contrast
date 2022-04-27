
class Contrast < Formula
    desc "Initial release"
    homepage "https://www.contrastsecurity.com/"
    license "MIT"
  
    if OS.mac?
      url "https://contrastsecurity.jfrog.io/artifactory/cli/1.0.0/mac/contrast"
      sha256 "44135048b595ffd959fabd932b89bf8220102d7474e69840161888d997632d6f"
      
    elsif OS.linux?
      if Hardware::CPU.intel?
        url "https://contrastsecurity.jfrog.io/artifactory/cli/1.0.0/linux/contrast"
        sha256 "4c1ddacbaecf446f3cb6272209e35e0b4d4278c2c72b12acc7d190b46df3ad5c"
      end
    end
  
    def install
      bin.install "contrast"
    end
  end
  
