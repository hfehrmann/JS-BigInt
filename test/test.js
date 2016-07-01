

var assert = require('assert');
var chai_assert = require('chai').assert;
var BigInt = require('../BigInt')

describe('BigInt', function() {
  describe('#creation()', function () {
    it('should represent numbers on binary', function () {
      assert.equal("+ 1111111111111111", BigInt.fromInteger(0xffff).toBinaryString());
      assert.equal("+ 1110111111101111", BigInt.fromInteger(0xefef).toBinaryString());
      assert.equal("+ 1110111111101111-1111111111111111", BigInt.fromInteger(0xefefffff).toBinaryString());
      assert.equal("+ 0000000000000001-0000000000000000-0000000000000000-0000000000000000-0000000000000000-0000000000000000",
      				BigInt.fromHexString("0x100000000000000000000").toBinaryString())
    });
    it('should represent numbers on hex', function () {
      assert.equal("+ 0x0000ffff", BigInt.fromInteger(0xffff).toHexString());
      assert.equal("+ 0x0000efef", BigInt.fromInteger(0xefef).toHexString());
      assert.equal("+ 0xefefffff", BigInt.fromInteger(0xefefffff).toHexString());
      assert.equal("+ 0x00010000-00000000-00000000", BigInt.fromHexString("0x100000000000000000000").toHexString());

      assert.equal("+ 0x89abcdef", BigInt.fromHexString("0x89abcdef").toHexString());
      assert.equal("+ 0x01234567-89abcdef", BigInt.fromHexString("0x0123456789abcdef").toHexString());
      assert.equal("+ 0xf1234567-89abcdef", BigInt.fromHexString("0xf123456789abcdef").toHexString());
    });
  });
  describe('#negative_creation()', function () {
    it('should represent numbers on binary', function () {
      assert.equal("- 1111111111111111", BigInt.fromInteger(-0xffff).toBinaryString());
      assert.equal("- 1110111111101111", BigInt.fromInteger(-0xefef).toBinaryString());
      assert.equal("- 1110111111101111-1111111111111111", BigInt.fromInteger(-0xefefffff).toBinaryString());
    });
    it('should represent numbers on hex', function () {
      assert.equal("- 0x0000ffff", BigInt.fromInteger(-0xffff).toHexString());
      assert.equal("- 0x0000efef", BigInt.fromInteger(-0xefef).toHexString());
      assert.equal("- 0xefefffff", BigInt.fromInteger(-0xefefffff).toHexString());
      assert.equal("- 0x00010000-00000000-00000000", BigInt.fromHexString("- 0x100000000000000000000").toHexString());
    });
  });
});


describe('BigInt', function() {
  describe('#concatenation()', function () {
    it('should represent numbers on binary after concatenation', function () {
      assert.equal("+ 1111111111111111-0000000000000000-1110111111101111", 
      				BigInt.fromInteger(0xffff).concat(BigInt.fromInteger(0xefef)).toBinaryString());

      var neg = BigInt.fromInteger(0xcccccccc).concat(BigInt.fromInteger(0x00ff))
      assert.equal("+ 1100110011001100-1100110011001100-0000000000000000-0000000011111111", neg.toBinaryString());
    });
  });
});

describe('BigInt', function() {
  describe('#negate()', function () {
    it('should negate number', function () {
    	var number = BigInt.fromInteger(0xffff).concat(BigInt.fromInteger(0xefef));
		assert.equal("- 1111111111111111-0000000000000000-1110111111101111", number.negate().toBinaryString());
		assert.equal("- 1111111111111111", BigInt.fromInteger(0xffff).negate().toBinaryString());

		var neg = BigInt.fromInteger(-0xcccccccc).concat(BigInt.fromInteger(0x00ff))
		assert.equal("- 1100110011001100-1100110011001100-0000000000000000-0000000011111111", neg.negate().toBinaryString());
    });
  });
});

describe('BigInt', function() {
  describe('#highest_bit()', function () {
    it('should print highest bit counting all blocks from left to right', function () {
      var number = BigInt.fromInteger(0xffff)
      assert.equal(16, number.getPositionHighestBit())

      number = BigInt.fromInteger(0x1ffffffff)
      assert.equal(31, number.getPositionHighestBit())

      number = BigInt.zero.concat(BigInt.fromInteger(0x0001ffff));
      assert.equal(47, number.getPositionHighestBit())

      number = BigInt.zero;
      assert.equal(32, number.getPositionHighestBit())
    });
  });
});

describe('BigInt', function() {
  describe('#shift_left()', function () {
    it('should shift digits', function () {
      assert.equal("+ 0000000000000001-0000000000000000-0000000000000000", BigInt.fromInteger(0x1).shift_left(32).toBinaryString());
      assert.equal("- 0000000000000001-0000000000000000-0000000000000000", BigInt.fromInteger(-0x1).shift_left(32).toBinaryString());
      assert.equal("- 0000000000000011-0011111110001100-0000000000000000", BigInt.fromInteger(-0xcfe3).shift_left(18).toBinaryString());
      var n1;

      n1 = BigInt.fromHexString("0x1111 1111 1111 1111 1111")
      assert.equal("+ 0x04444444-44444444-44444000-00000000-00000000", n1.shift_left(78).toHexString());
    });
  });
});

describe('BigInt', function() {
  describe('#shift_right()', function () {
    it('should shift digits', function () {
      assert.equal("+ 0000000000000001", BigInt.fromInteger(0x100000000).shift_right(32).toBinaryString());
      assert.equal("- 0000000000001111-1111111111111111", BigInt.fromInteger(-0xfffff00000000).shift_right(32).toBinaryString());
      assert.equal("- 0000111111111111", BigInt.fromInteger(-0xfffff00ff00ff).shift_right(40).toBinaryString());

      var n1;
      n1 = BigInt.fromHexString("0x3333 33333333 33333333 33333333 33333333")
      assert.equal("+ 0x06666666-66666666-66666666", n1.shift_right(51).toHexString());

      n1 = BigInt.fromHexString("0x3333 33333333 33333333 33333333 33333333")
      assert.equal("+ 0x00003333-33333333-33333333-33333333-33333333", n1.shift_right(0).toHexString());

    });
  });
});

describe('BigInt', function() {
  describe('#subBits()', function () {
    it('should extract subBits in range (first inclusive, last exclusive)', function () {
      assert.equal("+ 0x000000ab", BigInt.fromInteger(0xabcdef).subBits(0,16).toHexString());
      assert.equal("+ 0x0000cdef", BigInt.fromInteger(0x00abcdef).subBits(16,32).toHexString());
      assert.equal("+ 0x00abcdef", BigInt.fromInteger(0x00abcdef).subBits(0,32).toHexString());

      assert.equal("+ 0x456789ab", BigInt.fromHexString("0x0123456789abcdef").subBits(16,48).toHexString());
      assert.equal("+ 0x00000011-59e26af3", BigInt.fromHexString("0x0123456789abcdef").subBits(17,54).toHexString());
      assert.equal("+ 0x456789ab-cdef0123",BigInt.fromHexString("0x0123456789abcdef0123456789abcdef").subBits(16,80).toHexString());
      
      var n1;
      n1 = BigInt.fromHexString("0xcdef0123 456789ab cdef0123 456789ab cdef0123 456789ab");
      assert.equal("+ 0x01234567-89abcdef-01234567-89abcdef-01234567",n1.subBits(16,176).toHexString());
    });
  });
});

describe('BigInt', function() {
  describe('#absolute_compare()', function () {
    it('should compare positive number', function () {
      var n1, n2;
      n1 = BigInt.fromHexString("0x3333 33333333 33333333 33333333 33333333");
      n2 = BigInt.fromHexString("0x3333 33333333 33333333 33333333 33333332");
	  chai_assert.isAbove(n1.abs_cmp(n2), 0);
	  chai_assert.isBelow(n2.abs_cmp(n1), 0);
	  chai_assert.equal(n2.abs_cmp(n2), 0);
	  chai_assert.equal(n1.abs_cmp(n1), 0);

	  n2 = BigInt.fromHexString("0x3333 33333333 33333333 33333332");
	  chai_assert.isAbove(n1.abs_cmp(n2), 0);
	  chai_assert.isBelow(n2.abs_cmp(n1), 0);
    });
    it('should compare negative number', function () {
      var n1, n2;
      n1 = BigInt.fromHexString("-0x3333 33333333 33333333 33333333 33333333");
      n2 = BigInt.fromHexString("-0x3333 33333333 33333333 33333333 33333332");
	  chai_assert.isAbove(n1.abs_cmp(n2), 0);
	  chai_assert.isBelow(n2.abs_cmp(n1), 0);
	  chai_assert.equal(n2.abs_cmp(n2), 0);
	  chai_assert.equal(n1.abs_cmp(n1), 0);

	  n2 = BigInt.fromHexString("-0x3333 33333333 33333333 33333332");
	  chai_assert.isAbove(n1.abs_cmp(n2), 0);
	  chai_assert.isBelow(n2.abs_cmp(n1), 0);
    });
    it('should compare any number', function () {
      var n1, n2;
      n1 = BigInt.fromHexString("-0x3333 33333333 33333333 33333333 33333333");
      n2 = BigInt.fromHexString("0x3333 33333333 33333333 33333333 33333332");
	  chai_assert.isAbove(n1.abs_cmp(n2), 0);
	  chai_assert.isBelow(n2.abs_cmp(n1), 0);

	  n1 = BigInt.fromHexString("-0x3333 33333333 33333333 33333332");
	  chai_assert.isAbove(n2.abs_cmp(n1), 0);
	  chai_assert.isBelow(n1.abs_cmp(n2), 0);
    });
  });
});

describe('BigInt', function() {
  describe('#addition()', function () {
    it('should add positive numbers (both)', function () {
    	var ff = BigInt.fromInteger(0xffff);
     	assert.equal("+ 0000000000000001-0000000000000000", ff.add(BigInt.one).toBinaryString()) ;
    });
    it('should add negative numbers (both)', function () {
    	var ff = BigInt.fromInteger(-0xffff);
    	var m_one = BigInt.one.negate();
    	var ff00 = BigInt.fromInteger(-0xff00);
    	var OOff = BigInt.fromInteger(-0x00ff);
     	assert.equal("- 0000000000000001-0000000000000000", ff.add(m_one).toBinaryString());
     	assert.equal("- 1111111111111111", ff00.add(OOff).toBinaryString());
    });
    it('should add when substracting number with different sign', function(){
    	var n1 = BigInt.fromInteger(-0xffff)
    	var n2 = BigInt.one;
    	assert.equal("- 0000000000000001-0000000000000000", n1.substract(n2).toBinaryString());

    	var n3 = BigInt.fromInteger(0xeeefffff);
    	var n4 = BigInt.one.negate();
    	assert.equal("+ 1110111011110000-0000000000000000", n3.substract(n4).toBinaryString());


    	n3 = BigInt.fromInteger(0xbffffffff);
    	n4 = BigInt.one.negate();
    	assert.equal("+ 0000000000001100-0000000000000000-0000000000000000", n3.substract(n4).toBinaryString());
    });
  });
}); 	

describe('BigInt', function() {
  describe('#substraction()', function () {
    it('should preserve sign if the former number is bigger', function () {
    	var n1,n2;
    	n1 = BigInt.fromInteger(0x2);
    	n2 = BigInt.one;
    	assert.equal("+ 0000000000000001", n1.substract(n2).toBinaryString());

    	n1 = BigInt.fromInteger(0xffffffff);
    	n2 = BigInt.fromInteger(0x0003eeee);
    	assert.equal("+ 1111111111111100-0001000100010001", n1.substract(n2).toBinaryString());

    	n1 = BigInt.fromInteger(-0xffffffff);
    	n2 = BigInt.fromInteger(-0x0003eeee);
    	assert.equal("- 1111111111111100-0001000100010001", n1.substract(n2).toBinaryString());

    	n1 = BigInt.fromInteger(0x100000000);
    	n2 = BigInt.fromInteger(0x1);
    	assert.equal("+ 1111111111111111-1111111111111111", n1.substract(n2).toBinaryString());
    });
    it('should switch sign if the former number is smallest', function () {
    	var n1,n2;
    	n1 = BigInt.one;
    	n2 = BigInt.fromInteger(0x2);
    	assert.equal("- 0000000000000001", n1.substract(n2).toBinaryString());

    	n1 = BigInt.fromInteger(0x0003eeee);
		n2 = BigInt.fromInteger(0xffffffff);
    	assert.equal("- 1111111111111100-0001000100010001", n1.substract(n2).toBinaryString());    	

    	n1 = BigInt.fromInteger(-0x0003eeee);
    	n2 = BigInt.fromInteger(-0xffffffff);
    	assert.equal("+ 1111111111111100-0001000100010001", n1.substract(n2).toBinaryString());


    	n1 = BigInt.fromInteger(0x1);
    	n2 = BigInt.fromInteger(0x100000000);
    	assert.equal("- 1111111111111111-1111111111111111", n1.substract(n2).toBinaryString());
    });
    it('should add when numbers are from different signs', function () {
    	var ff = BigInt.fromInteger(-0xffff);
    	var m_one = BigInt.one;
    	var ff00 = BigInt.fromInteger(0xff00);
    	var OOff = BigInt.fromInteger(-0x00ff);
     	assert.equal("- 0000000000000001-0000000000000000", ff.substract(m_one).toBinaryString());
     	assert.equal("+ 1111111111111111", ff00.substract(OOff).toBinaryString());
    });
  });
}); 	

describe('BigInt', function() {
  describe('#multiplication()', function () {
    describe(' multiplying numbers with 1 block',function(){
  	  it('should should throw positive number with same sign numbers', function () {
        var n1, n2;
        n1 = BigInt.fromInteger(0x2)
        assert.equal("+ 0000000000000100", n1.multiply(n1).toBinaryString());

		n1 = BigInt.fromInteger(0xffff)
		assert.equal("+ 1111111111111110-0000000000000001", n1.multiply(n1).toBinaryString());

		n1 = BigInt.fromInteger(-0xffff)
		assert.equal("+ 1111111111111110-0000000000000001", n1.multiply(n1).toBinaryString());

		n1 = BigInt.fromInteger(0xfed1);
		n2 = BigInt.fromInteger(0xbac9);
		assert.equal("+ 1011100111101011-1110110000011001", n1.multiply(n2).toBinaryString());

		n1 = BigInt.fromInteger(-0xfed1);
		n2 = BigInt.fromInteger(-0x21);
		assert.equal("+ 0000000000100000-1101100011110001", n1.multiply(n2).toBinaryString());
      });     
  	});
  	describe(' multiplying numbers with +1 block',function(){
  	  it('should should throw positive number with same sign numbers', function () {
        var n1, n2;
        n1 = BigInt.fromInteger(0xfed1);
		n2 = BigInt.fromInteger(0xbac9);
		assert.equal("+ 1011100111101011-1110110000011001", n1.multiply(n2).toBinaryString());

		n1 = BigInt.fromHexString("0x1 00000000 00000000 ffffffff eeeeeeee")
		n2 = BigInt.one;
		assert.equal("+ 0x00000001-00000000-00000000-ffffffff-eeeeeeee", n1.multiply(n2).toHexString());		

      });     
  	});// 5225655556*82215552 = 0000010111110110|0101101001011001|1100011100001010|1000101000000000
  });
  describe('#negative_multiplication()', function () {
  	describe(' multiplying numbers with +1 block',function(){
  	  it('should should throw negative number with distinct sign numbers', function () {
        var n1, n2;
        n1 = BigInt.fromInteger(0x32f02d04);
        n2 = BigInt.fromInteger(-0xf2019)
        assert.equal("- 0000000000000011-0000001001110101-1010001001010000-1110010101100100",n1.multiply(n2).toBinaryString());

        n1 = BigInt.fromInteger(0x32f02d0f4);
        n2 = BigInt.fromInteger(-0x1)
        assert.equal("- 0000000000000011-0010111100000010-1101000011110100",n1.multiply(n2).toBinaryString());

        n1 = BigInt.fromInteger(-0xd32f02d04);
        n2 = BigInt.fromInteger(0xf)
        assert.equal("- 0000000011000101-1111110000010010-1010001100111100",n1.multiply(n2).toBinaryString());

  		n1 = BigInt.fromInteger(0x137792d04);// 100110111011110010010110100000100
		n2 = BigInt.fromInteger(-0x4e68280); // 100111001101000001010000000
		assert.equal("- 0000010111110110-0101101001011001-1100011100001010-1000101000000000", n1.multiply(n2).toBinaryString());
      });     
  	});
  });
});

describe('BigInt', function() {
  describe('#division()', function () {
    it('should divide numbers with remainder', function () {
      var n1, n2;

      n1 = BigInt.fromInteger(0xfc13);
      n2 = BigInt.fromInteger(0x4);
      //assert.equal("+ 0011111100000100", n1.divide(n2).toBinaryString());
    });
  });
});

// describe('BigInt', function() {
//   describe('#shift_left()', function () {
//     it('should shift digits', function () {
//       assert.equal("+ 0000000000000001-0000000000000000-0000000000000000", BigInt.fromInteger(0x1).shift_left(32).toBinaryString());
//       assert.equal("- 0000000000000001-0000000000000000-0000000000000000", BigInt.fromInteger(-0x1).shift_left(32).toBinaryString());
//       assert.equal("- 0000000000000011-0011111110001100-0000000000000000", BigInt.fromInteger(-0xcfe3).shift_left(18).toBinaryString());
//     });
//   });
// });