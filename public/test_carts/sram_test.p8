pico-8 cartridge // http://www.pico-8.com
version 29
__lua__
cartdata("retrokit_sram_test")
val = dget(0)
if val == 0 then
  val = 1
  dset(0, val)
end

function _update()
  if btnp(4) or btnp(5) then
    val = val + 1
    dset(0, val)
  end
end

function _draw()
  cls(1)
  print("pico-8 sram test", 25, 20, 7)
  print("save value: "..val, 30, 40, 10)
  print("press z/x to increment", 15, 60, 6)
  print("then click export sram", 15, 75, 11)
end
